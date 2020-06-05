using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.SQLite;

namespace Pilot.Web.Model.Bim.Database.ModelPart
{
    public interface IModelPartDatabaseWriter : IDisposable
    {
        DbTransaction BeginTransaction();
        void AddIfcNode(IfcNode node, Guid versionId, DateTime revision);
        void AddTessellation(Guid tessellationId, ModelMesh mesh, Guid objectId, Guid versionId, DateTime revision);
        void RemoveNodes(IEnumerable<Guid> ids, Guid versionId, DateTime revision);
        void Merge(string path);
        DateTime GetLatestVersion();
    }

    public interface IModelPartDatabaseReader : IDisposable
    {
        IEnumerable<IfcNode> GetIfcNodesByVersion(DateTime revisionFrom, DateTime revisionTo);
        IEnumerable<IfcNode> GetIfcNodesToCompare(DateTime revisionFrom, DateTime revisionTo, Dictionary<Guid, Tessellation> contextTessellations);
        IEnumerable<Tessellation> GetTessellations(DateTime revisionFrom, DateTime revisionTo);
        IEnumerable<Tessellation> GetTessellationsToCompare(DateTime revisionFrom, DateTime revisionTo);
    }

    public class ModelPartDatabaseWriter : IModelPartDatabaseWriter
    {

        private readonly NodeUpdater _nodeUpdater;
        private readonly TessellationUpdater _tessellationUpdater;
        private readonly VersionIdSelector _versionSelector;

        private readonly DatabaseMerger _databaseMerger;
        private readonly SQLiteConnection _connection;

        public ModelPartDatabaseWriter(string filename)
        {
            var databaseCreator = new DatabaseCreator();
            databaseCreator.CreateModelPartDatabase(filename);

            _connection = new DatabaseConnector().Connect(filename);

            _tessellationUpdater = new TessellationUpdater(_connection);
            _nodeUpdater = new NodeUpdater(_connection);
            _databaseMerger = new DatabaseMerger(_connection);
            _versionSelector = new VersionIdSelector(_connection);
        }

        public DbTransaction BeginTransaction()
        {
            return _connection.BeginTransaction();
        }

        public void AddIfcNode(IfcNode node, Guid versionId, DateTime revision)
        {
            _nodeUpdater.Insert(node, versionId, revision);
        }

        public void AddTessellation(Guid tessellationId, ModelMesh mesh, Guid objectId, Guid versionId, DateTime revision)
        {
            _tessellationUpdater.InsertOrUpdate(tessellationId, mesh, objectId, versionId, revision);
        }

        public void RemoveNodes(IEnumerable<Guid> ids, Guid versionId, DateTime revision)
        {
            foreach (var guid in ids)
            {
                _nodeUpdater.InsertDeleted(guid, versionId, revision);
            }
        }

        public void Merge(string path)
        {
            _databaseMerger.Merge(path);
        }

        public DateTime GetLatestVersion()
        {
            return _versionSelector.Select();
        }

        public void Dispose()
        {
            _nodeUpdater.Dispose();
            _tessellationUpdater.Dispose();
            _databaseMerger.Dispose();
            _versionSelector.Dispose();

            _connection.Dispose();
        }
    }

    public class ModelPartDatabaseReader : IModelPartDatabaseReader
    {
        private readonly Guid _modelPartId;
        private readonly SQLiteConnection _connection;

        private readonly TessellationsAscendingSelector _tessellationsAscendingSelector;
        private readonly TessellationsDescendingSelector _tessellationsDescendingSelector;
        private readonly TessellationsToCompareSelector _tessellationsToCompareSelector;

        private readonly NodesVersionsAscendingSelector _nodeVersionsAscendingSelector;
        private readonly NodesVersionsDescendingSelector _nodeVersionsDescendingSelector;

        private readonly NodesDiffSelector _nodeDiffSelector;

        public ModelPartDatabaseReader(string filename, Guid modelPartId)
        {
            _modelPartId = modelPartId;
            var databaseCreator = new DatabaseCreator();
            databaseCreator.CreateModelPartDatabase(filename);

            _connection = new DatabaseConnector().Connect(filename);

            _tessellationsAscendingSelector = new TessellationsAscendingSelector(_connection);
            _tessellationsDescendingSelector = new TessellationsDescendingSelector(_connection);
            _tessellationsToCompareSelector = new TessellationsToCompareSelector(_connection);

            _nodeDiffSelector = new NodesDiffSelector(_connection, modelPartId);
            _nodeVersionsAscendingSelector = new NodesVersionsAscendingSelector(_connection, modelPartId);
            _nodeVersionsDescendingSelector = new NodesVersionsDescendingSelector(_connection, modelPartId);
        }

        public IEnumerable<IfcNode> GetIfcNodesByVersion(DateTime revisionFrom, DateTime revisionTo)
        {
            var relation = DateTime.Compare(revisionFrom, revisionTo);

            return relation <= 0 ? 
                _nodeVersionsAscendingSelector.Select(revisionFrom, revisionTo) : 
                _nodeVersionsDescendingSelector.Select(revisionFrom, revisionTo);
        }

        public IEnumerable<IfcNode> GetIfcNodesToCompare(DateTime revisionFrom, DateTime revisionTo, Dictionary<Guid, Tessellation> contextTessellations)
        {
            return _nodeDiffSelector.Select(revisionFrom, revisionTo, contextTessellations);
        }

        public IEnumerable<Tessellation> GetTessellations(DateTime revisionFrom, DateTime revisionTo)
        {
            var relation = DateTime.Compare(revisionFrom, revisionTo);

            return relation <= 0 ?
                _tessellationsAscendingSelector.Select(revisionFrom, revisionTo) :
                _tessellationsDescendingSelector.Select(revisionFrom, revisionTo);
        }

        public IEnumerable<Tessellation> GetTessellationsToCompare(DateTime revisionFrom, DateTime revisionTo)
        {
           return _tessellationsToCompareSelector.Select(revisionFrom, revisionTo);
        }

        public void Dispose()
        {
            _tessellationsAscendingSelector.Dispose();
            _tessellationsDescendingSelector.Dispose();
            _tessellationsToCompareSelector.Dispose();

            _nodeDiffSelector.Dispose();
            _nodeVersionsDescendingSelector.Dispose();
            _nodeVersionsAscendingSelector.Dispose();

            _connection.Dispose();
        }
    }
}
