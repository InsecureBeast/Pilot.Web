using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SQLite;
using System.Globalization;

namespace Pilot.Web.Model.Bim.Database.ModelPart
{
    static class ModelPartSqlConstants
    {
        public const string DATE_FORMAT = "yyyyMMddHHmmssFFF";
    }

    static class ModelPartSqlDataConverter
    {
        public static long ConvertDateTimeToInt(DateTime dt)
        {
            return long.Parse(dt.ToString(ModelPartSqlConstants.DATE_FORMAT));
        }
    }

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
                    return reader.IsDBNull(0) ? DateTime.MinValue : DateTime.ParseExact(reader.GetInt64(0).ToString(), ModelPartSqlConstants.DATE_FORMAT, CultureInfo.InvariantCulture);
                }
            }

            return DateTime.MinValue;
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
            //ParamTo.Value = revisionTo.ToString(ModelPartSqlConstants.DATE_FORMAT);
            //ParamFrom.Value = revisionFrom.ToString(ModelPartSqlConstants.DATE_FORMAT);

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

            _paramTo = new SQLiteParameter { DbType = DbType.String, ParameterName = "@revisionTo" };
            _paramFrom = new SQLiteParameter { DbType = DbType.String, ParameterName = "@revisionFrom" };

            _command.Parameters.Add(_paramTo);
            _command.Parameters.Add(_paramFrom);
        }

        public IEnumerable<IfcNode> Select(DateTime revisionFrom, DateTime revisionTo, Dictionary<Guid, Tessellation> contextTessellations)
        {
            _paramTo.Value = revisionTo.ToString(ModelPartSqlConstants.DATE_FORMAT);
            _paramFrom.Value = revisionFrom.ToString(ModelPartSqlConstants.DATE_FORMAT);

            using (var reader = _command.ExecuteReader())
            {
                while (reader.Read())
                {
                    var id = reader.IsDBNull(0) ? Guid.Empty : reader.GetGuid(0);

                    var newRevision = reader.IsDBNull(1) ? null : reader.GetString(1);
                    var newNode = BimProtoSerializer.Deserialize<IfcNode>(reader.GetFieldValue<byte[]>(3));

                    var oldRevision = reader.IsDBNull(2) ? null : reader.GetString(2);
                    var oldNode = BimProtoSerializer.Deserialize<IfcNode>(reader.GetFieldValue<byte[]>(4));

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
                        //if (IfcNodeChangeAnalyzer.Compare(oldPlacement, newPlacement, contextTessellations))
                        //{
                        //    yield return new IfcNode
                        //    {
                        //        Guid = id,
                        //        ModelPartId = _modelPartId,
                        //        ParentGuid = reader.IsDBNull(4) ? Guid.Empty : reader.GetGuid(4),
                        //        Name = newName,
                        //        Type = type,
                        //        Attributes = newData,
                        //        MeshesProperties = newPlacement,
                        //        ObjectState = IfcNodeState.PlacementAndAttributesModified
                        //    };
                        //}
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
}
