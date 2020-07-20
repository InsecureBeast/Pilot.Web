using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SQLite;
using Pilot.Web.Model.Bim.Serialization;

namespace Pilot.Web.Model.Bim.Database.ModelPart
{
    public static class ModelPartSqlConstants
    {
        public const string DATE_FORMAT = "yyyyMMddHHmmssFFF";
    }

    public static class ModelPartSqlDataConverter
    {
        public static long ConvertDateTimeToInt(DateTime dateDate)
        {
            return dateDate.Ticks;
        }
    }

    #region Updaters
    class NodeUpdater : IDisposable
    {
        private SQLiteCommand _commandAdd;
        private SQLiteCommand _commandRemove;

        private readonly SQLiteParameter _paramId;
        private readonly SQLiteParameter _paramRevision;
        private readonly SQLiteParameter _paramData;
        private readonly SQLiteParameter _aParamData;

        public NodeUpdater(SQLiteConnection connection)
        {
            _commandAdd = new SQLiteCommand(connection)
            {
                CommandText =
                  "INSERT INTO [nodes] (object_id, revision, data) VALUES (@object_id, @revision, @data); " +
                  "INSERT INTO [attributes] (object_id, revision, data) VALUES (@object_id, @revision, @attributes); "
            };

            _commandRemove = new SQLiteCommand(connection)
            {
                CommandText = "INSERT INTO [nodes] (object_id, revision, data) VALUES (@object_id, @revision, @data)"
            };

            _paramId = new SQLiteParameter { DbType = DbType.Guid, ParameterName = "@object_id" };
            _paramRevision = new SQLiteParameter { DbType = DbType.Int64, ParameterName = "@revision" };
            _paramData = new SQLiteParameter { DbType = DbType.Binary, ParameterName = "@data" };
            _aParamData = new SQLiteParameter { DbType = DbType.Binary, ParameterName = "@attributes" };

            _commandAdd.Parameters.Add(_paramId);
            _commandAdd.Parameters.Add(_paramRevision);
            _commandAdd.Parameters.Add(_paramData);
            _commandAdd.Parameters.Add(_aParamData);

            _commandRemove.Parameters.Add(_paramId);
            _commandRemove.Parameters.Add(_paramRevision);
            _commandRemove.Parameters.Add(_paramData);
        }

        public void Insert(IfcNode node, Guid versionId, DateTime revision)
        {
            _paramId.Value = node.Guid;
            _paramRevision.Value = ModelPartSqlDataConverter.ConvertDateTimeToInt(revision);
            _paramData.Value = BimProtoSerializer.Serialize(node);
            _aParamData.Value = BimProtoSerializer.Serialize(node.Attributes);

            _commandAdd.ExecuteNonQuery();
        }

        public void InsertDeleted(Guid node, Guid versionId, DateTime revision)
        {
            _paramId.Value = node;
            _paramRevision.Value = ModelPartSqlDataConverter.ConvertDateTimeToInt(revision);
            _paramData.Value = null;

            _commandRemove.ExecuteNonQuery();
        }

        public void Dispose()
        {
            _commandAdd.Dispose();
            _commandRemove.Dispose();
        }
    }

    class TessellationUpdater : IDisposable
    {
        private readonly SQLiteCommand _command;

        private readonly SQLiteParameter _paramId;
        private readonly SQLiteParameter _paramObjectId;
        private readonly SQLiteParameter _paramRevision;
        private readonly SQLiteParameter _paramData;

        public TessellationUpdater(SQLiteConnection connection)
        {
            _command = new SQLiteCommand(connection)
            {
                CommandText = "REPLACE INTO [tessellations] (id, object_id, revision, data) VALUES (?, ?, ?, ?)"
            };

            _paramId = new SQLiteParameter { DbType = DbType.Guid };
            _paramObjectId = new SQLiteParameter { DbType = DbType.Guid };
            _paramRevision = new SQLiteParameter { DbType = DbType.Int64 };
            _paramData = new SQLiteParameter { DbType = DbType.Binary };

            _command.Parameters.Add(_paramId);
            _command.Parameters.Add(_paramObjectId);
            _command.Parameters.Add(_paramRevision);
            _command.Parameters.Add(_paramData);
        }

        public int InsertOrUpdate(Guid id, ModelMesh tessellation, Guid objectId, Guid versionId, DateTime revision)
        {
            var data = BimProtoSerializer.Serialize(tessellation);
            _paramId.Value = id;
            _paramObjectId.Value = objectId;
            _paramRevision.Value = ModelPartSqlDataConverter.ConvertDateTimeToInt(revision);
            _paramData.Value = data;

            _command.ExecuteNonQuery();

            return data.Length;
        }

        public void Dispose()
        {
            _command.Dispose();
        }
    }

    #endregion

    #region Selectors
    class VersionIdSelector : IDisposable
    {
        protected SQLiteCommand Command;

        public VersionIdSelector(SQLiteConnection connection)
        {
            Command = new SQLiteCommand(connection)
            {
                CommandText = "SELECT MAX(revision) as revision " +
                              "FROM nodes "
            };
        }

        public DateTime Select()
        {
            using (var reader = Command.ExecuteReader())
            {
                while (reader.Read())
                {
                    return reader.IsDBNull(0) ? DateTime.MinValue : new DateTime(reader.GetInt64(0));
                }
            }

            return DateTime.MinValue;
        }

        public void Dispose()
        {
            Command.Dispose();
        }
    }

    class NodeAttributesSelector : IDisposable
    {
        protected SQLiteCommand Command;

        protected readonly SQLiteParameter ParamRevision;
        protected readonly SQLiteParameter ParamId;

        public NodeAttributesSelector(SQLiteConnection connection)
        {
            Command = new SQLiteCommand(connection)
            {
                CommandText = "SELECT data, MAX(revision) as revision " +
                              "FROM attributes " +
                              "WHERE revision <= @revision AND object_id = @id"
            };

            ParamRevision = new SQLiteParameter { DbType = DbType.Int64, ParameterName = "@revision" };
            ParamId = new SQLiteParameter { DbType = DbType.Guid, ParameterName = "@id" };

            Command.Parameters.Add(ParamId);
            Command.Parameters.Add(ParamRevision);
        }

        public ElementPropertySet[] Select(Guid id, DateTime revision)
        {
            ParamId.Value = id;
            ParamRevision.Value = ModelPartSqlDataConverter.ConvertDateTimeToInt(revision);

            using (var reader = Command.ExecuteReader())
            {
                while (reader.Read())
                {
                    return reader.IsDBNull(0) ? Array.Empty<ElementPropertySet>() : BimProtoSerializer.Deserialize<ElementPropertySet[]>(reader.GetFieldValue<byte[]>(0));
                }
            }

            return Array.Empty<ElementPropertySet>();
        }

        public void Dispose()
        {
            Command.Dispose();
        }
    }

    class NodesVersionsBaseSelector : IDisposable
    {
        protected SQLiteCommand Command;

        protected readonly Guid ModelPartId;
        protected readonly SQLiteParameter ParamTo;
        protected readonly SQLiteParameter ParamFrom;

        public NodesVersionsBaseSelector(SQLiteConnection connection, Guid modelPartId)
        {
            ModelPartId = modelPartId;

            ParamTo = new SQLiteParameter { DbType = DbType.Int64, ParameterName = "@revisionTo" };
            ParamFrom = new SQLiteParameter { DbType = DbType.Int64, ParameterName = "@revisionFrom" };
        }

        public IEnumerable<IfcNode> Select(DateTime revisionFrom, DateTime revisionTo)
        {
            ParamTo.Value = ModelPartSqlDataConverter.ConvertDateTimeToInt(revisionTo);
            ParamFrom.Value = ModelPartSqlDataConverter.ConvertDateTimeToInt(revisionFrom);

            using (var reader = Command.ExecuteReader())
            {
                while (reader.Read())
                {
                    var node = reader.IsDBNull(2) ? new IfcNode() : BimProtoSerializer.Deserialize<IfcNode>(reader.GetFieldValue<byte[]>(2));
                    var state = reader.IsDBNull(2) ? IfcNodeState.Removed : IfcNodeState.Added;

                    yield return node.WithId(reader.IsDBNull(0) ? Guid.Empty : reader.GetGuid(0))
                        .WithModelPartId(ModelPartId)
                        .WithObjectState(state);
                }
            }
        }

        public void Dispose()
        {
            Command.Dispose();
        }
    }

    class NodesVersionsAscendingSelector : NodesVersionsBaseSelector
    {
        public NodesVersionsAscendingSelector(SQLiteConnection connection, Guid modelPartId) : base(connection, modelPartId)
        {
            Command = new SQLiteCommand(connection)
            {
                CommandText = "SELECT object_id, MAX(revision) as revision, data " +
                              "FROM nodes " +
                              "WHERE revision <= @revisionTo AND revision > @revisionFrom " +
                              "GROUP BY object_id "
            };

            Command.Parameters.Add(ParamTo);
            Command.Parameters.Add(ParamFrom);
        }
    }

    class NodesVersionsDescendingSelector : NodesVersionsBaseSelector
    {
        public NodesVersionsDescendingSelector(SQLiteConnection connection, Guid modelPartId) : base(connection, modelPartId)
        {
            Command = new SQLiteCommand(connection)
            {
                CommandText = "SELECT A.object_id as object_id, MAX(B.revision) as revision, B.data as data " +
                              "FROM nodes as A " +
                              "LEFT OUTER JOIN nodes AS B " +
                              "ON B.revision < A.revision " +
                              "AND A.object_id = B.object_id " +
                              "AND B.revision <= @revisionTo " +
                              "WHERE A.revision <= @revisionFrom AND A.revision > @revisionTo " +
                              "GROUP BY A.object_id"
            };

            Command.Parameters.Add(ParamTo);
            Command.Parameters.Add(ParamFrom);
        }
    }

    class NodesDiffSelector : IDisposable
    {
        private readonly Guid _modelPartId;
        private readonly SQLiteCommand _command;

        private readonly SQLiteParameter _paramTo;
        private readonly SQLiteParameter _paramFrom;

        public NodesDiffSelector(SQLiteConnection connection, Guid modelPartId)
        {
            _modelPartId = modelPartId;
            _command = new SQLiteCommand(connection)
            {
                CommandText = "SELECT A.object_id as object_id, " +
                              "A.revision as new_revision, " +
                              "B.revision as old_revision, " +
                              "A.data as new_data, " +
                              "B.data as old_data " +
                              "FROM " +
                              "( " +
                              " SELECT object_id, MAX(revision) as revision, data " +
                              " FROM nodes " +
                              " WHERE revision <= @revisionTo AND revision > @revisionFrom " +
                              " GROUP BY object_id " +
                              ") as A " +
                              "LEFT JOIN nodes as B " +
                              "ON A.object_id = B.object_id " +
                              "AND B.revision <= @revisionFrom " +
                              "GROUP BY A.object_id"
            };

            _paramTo = new SQLiteParameter { DbType = DbType.Int64, ParameterName = "@revisionTo" };
            _paramFrom = new SQLiteParameter { DbType = DbType.Int64, ParameterName = "@revisionFrom" };

            _command.Parameters.Add(_paramTo);
            _command.Parameters.Add(_paramFrom);
        }

        public IEnumerable<IfcNode> Select(DateTime revisionFrom, DateTime revisionTo, Dictionary<Guid, Tessellation> contextTessellations)
        {
            _paramTo.Value = ModelPartSqlDataConverter.ConvertDateTimeToInt(revisionTo);
            _paramFrom.Value = ModelPartSqlDataConverter.ConvertDateTimeToInt(revisionFrom);

            using (var reader = _command.ExecuteReader())
            {
                while (reader.Read())
                {
                    var id = reader.IsDBNull(0) ? Guid.Empty : reader.GetGuid(0);

                    var newRevision = reader.IsDBNull(1) ? null : reader.GetInt64(1).ToString();
                    var newNode = reader.IsDBNull(3) ? null : BimProtoSerializer.Deserialize<IfcNode>(reader.GetFieldValue<byte[]>(3));

                    var oldRevision = reader.IsDBNull(2) ? null : reader.GetInt64(2).ToString();
                    var oldNode = reader.IsDBNull(4) ? null : BimProtoSerializer.Deserialize<IfcNode>(reader.GetFieldValue<byte[]>(4));

                    if (newNode == null && oldNode == null)
                    {
                        continue;
                    }
                    else if (newNode == null) //removed
                    {
                        yield return oldNode.WithId(id)
                            .WithModelPartId(_modelPartId)
                            .WithObjectState(IfcNodeState.Removed);
                    }
                    else if (oldNode == null)//added
                    {
                        yield return newNode.WithId(id)
                            .WithModelPartId(_modelPartId)
                            .WithObjectState(IfcNodeState.Added);
                    }
                    else if (oldRevision != null && !oldRevision.Equals(newRevision)) //modified
                    {
                        //TODO need to check attributes changed
                        if (IfcNodeChangeAnalyzer.Compare(newNode.MeshesProperties, oldNode.MeshesProperties, contextTessellations))
                        {
                            yield return newNode.WithId(id)
                                .WithModelPartId(_modelPartId)
                                .WithObjectState(IfcNodeState.PlacementAndAttributesModified);
                        }
                    }
                }
            }
        }

        public void Dispose()
        {
            _command.Dispose();
        }
    }

    class TessellationsBaseSelector : IDisposable
    {
        protected SQLiteCommand Command;

        protected SQLiteParameter ParamTo;
        protected SQLiteParameter ParamFrom;

        public TessellationsBaseSelector(SQLiteConnection connection)
        {
            ParamTo = new SQLiteParameter { DbType = DbType.Int64, ParameterName = "@revisionTo" };
            ParamFrom = new SQLiteParameter { DbType = DbType.Int64, ParameterName = "@revisionFrom" };
        }

        public IEnumerable<Tessellation> Select(DateTime revisionFrom, DateTime revisionTo)
        {
            ParamTo.Value = ModelPartSqlDataConverter.ConvertDateTimeToInt(revisionTo);
            ParamFrom.Value = ModelPartSqlDataConverter.ConvertDateTimeToInt(revisionFrom);

            using (var reader = Command.ExecuteReader())
            {
                while (reader.Read())
                {
                    yield return new Tessellation
                    {
                        Id = reader.GetGuid(0),
                        ModelMesh = BimProtoSerializer.Deserialize<ModelMesh>(reader.GetFieldValue<byte[]>(2))
                    };
                }
            }

        }

        public void Dispose()
        {
            Command.Dispose();
        }
    }

    class TessellationsAscendingSelector : TessellationsBaseSelector
    {
        public TessellationsAscendingSelector(SQLiteConnection connection) : base(connection)
        {
            Command = new SQLiteCommand(connection)
            {
                CommandText = "SELECT B.id, " +
                              "B.revision," +
                              "B.data " +
                              "FROM " +
                              "(" +
                              " SELECT object_id, " +
                              " MAX(revision) as revision " +
                              " FROM nodes " +
                              " WHERE revision <= @revisionTo AND revision > @revisionFrom " +
                              " GROUP BY object_id" +
                              ") as A " +
                              "INNER JOIN tessellations as B " +
                              "ON A.object_id = B.object_id " +
                              "AND B.revision = A.revision"
            };

            Command.Parameters.Add(ParamTo);
            Command.Parameters.Add(ParamFrom);
        }
    }

    class TessellationsDescendingSelector : TessellationsBaseSelector
    {
        public TessellationsDescendingSelector(SQLiteConnection connection) : base(connection)
        {
            Command = new SQLiteCommand(connection)
            {
                CommandText = "SELECT B.id, " +
                              "B.revision, " +
                              "B.data " +
                              "FROM " +
                              "( " +
                              " SELECT A.object_id as object_id, " +
                              " MAX(B.revision) as revision " +
                              " FROM nodes as A " +
                              " LEFT OUTER JOIN nodes AS B " +
                              " ON B.revision < A.revision " +
                              " AND A.object_id = B.object_id " +
                              " AND B.revision <= @revisionTo " +
                              " WHERE A.revision <= @revisionFrom AND A.revision > @revisionTo " +
                              " GROUP BY A.object_id " +
                              ") as A " +
                              "INNER JOIN tessellations as B " +
                              "ON A.object_id = B.object_id " +
                              "AND B.revision = A.revision"
            };

            Command.Parameters.Add(ParamTo);
            Command.Parameters.Add(ParamFrom);
        }
    }

    class TessellationsToCompareSelector : TessellationsBaseSelector
    {
        public TessellationsToCompareSelector(SQLiteConnection connection) : base(connection)
        {
            Command = new SQLiteCommand(connection)
            {
                CommandText = "SELECT D.id, D.revision, D.data " +
                              "FROM " +
                              "(" +
                              " SELECT A.object_id as object_id, " +
                              " A.revision as new_revision, " +
                              " B.revision as old_revision " +
                              " FROM " +
                              " (" +
                              "  SELECT object_id, MAX(revision) as revision " +
                              "  FROM nodes " +
                              "  WHERE revision <= @revisionTo AND revision > @revisionFrom " +
                              "  GROUP BY object_id" +
                              " ) as A " +
                              " LEFT JOIN nodes as B " +
                              " ON A.object_id = B.object_id " +
                              " AND B.revision <= @revisionFrom " +
                              " GROUP BY A.object_id " +
                              ") AS C " +
                              "INNER JOIN tessellations as D " +
                              "ON C.object_id = D.object_id " +
                              "AND (new_revision = D.revision OR old_revision = D.revision)"
            };

            Command.Parameters.Add(ParamTo);
            Command.Parameters.Add(ParamFrom);
        }
    }

    #endregion

    public class DatabaseMerger : IDisposable
    {
        private readonly SQLiteCommand _command;
        private readonly SQLiteParameter _paramToMergePath;

        public DatabaseMerger(SQLiteConnection connection)
        {
            _command = new SQLiteCommand(connection)
            {
                CommandText = "attach @toMergePath as toMerge; " +
                              "BEGIN; " +

                              "insert or replace into nodes select * from toMerge.nodes; " +
                              "insert or replace into attributes select * from toMerge.attributes; " +
                              "insert or replace into tessellations select * from toMerge.tessellations; " +

                              "COMMIT; " +
                              "detach toMerge;"
            };
            _paramToMergePath = new SQLiteParameter { DbType = DbType.String, ParameterName = "@toMergePath" };
            _command.Parameters.Add(_paramToMergePath);
        }

        public void Merge(string patToMerge)
        {
            _paramToMergePath.Value = patToMerge;
            _command.ExecuteNonQuery();
        }

        public void Dispose()
        {
            _command.Dispose();
        }
    }
}
