using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SQLite;
using System.Globalization;

namespace Pilot.Web.Model.Bim.Database.ModelPart
{
    public static class ModelPartSqlConstants
    {
        public const string DATE_FORMAT = "yyyyMMddHHmmssFFF";
    }

    #region Selectors
    class VersionIdSelector : IDisposable
    {
        protected SQLiteCommand Command;

        public VersionIdSelector(SQLiteConnection connection)
        {
            Command = new SQLiteCommand(connection)
            {
                CommandText = "SELECT MAX(revision) as revision, version_id " +
                              "FROM nodes "
            };
        }

        public DateTime Select()
        {
            using (var reader = Command.ExecuteReader())
            {
                while (reader.Read())
                {
                    return reader.IsDBNull(0) ? DateTime.MinValue : DateTime.ParseExact(reader.GetString(0), ModelPartSqlConstants.DATE_FORMAT, CultureInfo.InvariantCulture);
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

            ParamTo = new SQLiteParameter { DbType = DbType.String, ParameterName = "@revisionTo" };
            ParamFrom = new SQLiteParameter { DbType = DbType.String, ParameterName = "@revisionFrom" };
        }

        public IEnumerable<IfcNode> Select(DateTime revisionFrom, DateTime revisionTo)
        {
            ParamTo.Value = revisionTo.ToString(ModelPartSqlConstants.DATE_FORMAT);
            ParamFrom.Value = revisionFrom.ToString(ModelPartSqlConstants.DATE_FORMAT);

            using (var reader = Command.ExecuteReader())
            {
                while (reader.Read())
                {
                    yield return new IfcNode
                    {
                        Guid = reader.IsDBNull(0) ? Guid.Empty : reader.GetGuid(0),
                        ModelPartId = ModelPartId,
                        ParentGuid = reader.IsDBNull(2) ? Guid.Empty : reader.GetGuid(2),
                        Name = reader.IsDBNull(3) ? null : String.Intern(reader.GetString(3)),
                        Type = reader.IsDBNull(4) ? null : String.Intern(reader.GetString(4)),
                        Attributes = reader.IsDBNull(5) ? null : reader.GetString(5),
                        ObjectState = (reader.IsDBNull(3) && reader.IsDBNull(4)) ? IfcNodeState.Removed : IfcNodeState.Added,
                        MeshesProperties = reader.IsDBNull(6) ? null : MeshPropertiesSerializer.Deserialize(reader.GetFieldValue<byte[]>(6))
                    };
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
                CommandText = "SELECT object_id, MAX(revision) as revision, parent_id, name, type, data, placement " +
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
                CommandText = "SELECT A.object_id as object_id, MAX(B.revision) as revision, B.parent_id as parent_id,  B.name as name, B.type as type, B.data as data, B.placement as placement " +
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
                              "A.type as type, " +
                              "A.revision as new_revision, " +
                              "B.revision as old_revision, " +
                              "A.parent_id as new_parent_id, " +
                              "B.parent_id as old_parent_id, " +
                              "A.name as new_name, " +
                              "B.name as old_name, " +
                              "A.data as new_data, " +
                              "B.data as old_data, " +
                              "A.placement as new_placement, " +
                              "B.placement as old_placement " +
                              "FROM " +
                              "( " +
                              " SELECT object_id, type, MAX(revision) as revision, parent_id, name, data, placement " +
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
                    var type = reader.IsDBNull(1) ? null : string.Intern(reader.GetString(1));

                    var newName = reader.IsDBNull(6) ? null : string.Intern(reader.GetString(6));
                    var newData = reader.IsDBNull(8) ? null: reader.GetString(8);
                    var newRevision = reader.IsDBNull(2) ? null : reader.GetString(2);
                    var newPlacement = reader.IsDBNull(10) ? null : MeshPropertiesSerializer.Deserialize(reader.GetFieldValue<byte[]>(10));

                    var oldName = reader.IsDBNull(7) ? null : string.Intern(reader.GetString(7));
                    var oldData = reader.IsDBNull(9) ? null : reader.GetString(9);
                    var oldRevision = reader.IsDBNull(3) ? null : reader.GetString(3);
                    var oldPlacement = reader.IsDBNull(11) ? null : MeshPropertiesSerializer.Deserialize(reader.GetFieldValue<byte[]>(11));

                    if (newName == null && newData == null && oldName == null && oldData == null)
                    {
                        continue;
                    }
                    else if (newName == null && newData == null) //removed
                    {
                        yield return new IfcNode
                        {
                            Guid = id,
                            ModelPartId = _modelPartId,
                            ParentGuid = reader.IsDBNull(5) ? Guid.Empty : reader.GetGuid(5),
                            Name = oldName,
                            Type = type,
                            Attributes = oldData,
                            MeshesProperties = oldPlacement,
                            ObjectState = IfcNodeState.Removed
                        };
                    }
                    else if (oldName == null && oldData == null)//added
                    {
                        yield return new IfcNode
                        {
                            Guid = id,
                            ModelPartId = _modelPartId,
                            ParentGuid = reader.IsDBNull(4) ? Guid.Empty : reader.GetGuid(4),
                            Name = newName,
                            Type = type,
                            Attributes = newData,
                            MeshesProperties = newPlacement,
                            ObjectState = IfcNodeState.Added
                        };
                    }
                    else if (oldRevision != null && !oldRevision.Equals(newRevision)) //modified
                    {
                        //TODO need to check attributes changed
                        if (IfcNodeChangeAnalyzer.Compare(oldPlacement, newPlacement, contextTessellations))
                        {
                            yield return new IfcNode
                            {
                                Guid = id,
                                ModelPartId = _modelPartId,
                                ParentGuid = reader.IsDBNull(4) ? Guid.Empty : reader.GetGuid(4),
                                Name = newName,
                                Type = type,
                                Attributes = newData,
                                MeshesProperties = newPlacement,
                                ObjectState = IfcNodeState.PlacementAndAttributesModified
                            };
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
            ParamTo = new SQLiteParameter { DbType = DbType.String, ParameterName = "@revisionTo" };
            ParamFrom = new SQLiteParameter { DbType = DbType.String, ParameterName = "@revisionFrom" };
        }

        public IEnumerable<Tessellation> Select(DateTime revisionFrom, DateTime revisionTo)
        {
            ParamTo.Value = revisionTo.ToString(ModelPartSqlConstants.DATE_FORMAT);
            ParamFrom.Value = revisionFrom.ToString(ModelPartSqlConstants.DATE_FORMAT);

            using (var reader = Command.ExecuteReader())
            {
                while (reader.Read())
                {
                    yield return new Tessellation
                    {
                        Id = reader.GetGuid(0),
                        ModelMesh = ModelMeshSerializer.Deserialize(reader.GetFieldValue<byte[]>(2))
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
