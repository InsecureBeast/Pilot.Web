using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ascon.Pilot.BimUtils;
using Ascon.Pilot.BimUtils.Database;
using Ascon.Pilot.BimUtils.Database.BimMergers;
using Ascon.Pilot.DataClasses;
using Pilot.Web.Tools;

namespace Pilot.Web.Model.Bim.Model
{
    interface IBimModelPart : IDisposable
    {
        void Initialize();
        string GetModelPart();
        ElementPropertySet[] GetNodeAttributes(Guid nodeId, DateTime version);
        Task<IList<Tessellation>> GetTessellations(DateTime versionFrom, DateTime versionTo, CancellationToken token);
        Task<IList<IfcNode>> GetNodes(DateTime versionFrom, DateTime versionTo, CancellationToken token);
    }

    class BimModelPart : IBimModelPart, IModelPartInfo, IModelPartStorage
    {
        private readonly IFileLoader _fileLoader;
        private readonly IModelPartDirectory _modelPartDirectory;
        private readonly ModelPartVersionBuilder _partVersionBuilder;
        private readonly List<FileVersion> _versions;
        private IModelPartDatabaseReader _modelPartDatabaseReader;
        private bool _isInitialized;

        public BimModelPart(Guid databaseId, Guid modelPartId, IServerApiService serverApi, IFileLoader fileLoader)
        {
            _fileLoader = fileLoader;
            Id = modelPartId;

            var modelPart = serverApi.GetObject(modelPartId);
            if (modelPart == null)
                throw new ArgumentNullException(nameof(modelPart));

            var bimModelPartType = serverApi.GetType(BimSystemTypeNames.BIM_MODEL_PART);
            IsIfc = modelPart.TypeId == bimModelPartType.Id;

            var modelPartType = serverApi.GetType(modelPart.TypeId);
            ModelPartName = modelPart.GetTitle(modelPartType);

            var coordinationModelId = modelPart.ParentId;
            _modelPartDirectory = new ModelPartDirectory(databaseId, coordinationModelId, modelPart.Id);
            _partVersionBuilder = new ModelPartVersionBuilder(modelPart, serverApi);
            _versions = _partVersionBuilder.BuildVersions();
        }

        public string GetModelPart()
        {
            return _modelPartDirectory.GetPartModelPath();
        }

        public ElementPropertySet[] GetNodeAttributes(Guid nodeId, DateTime version)
        {
            var node = GetIfcNode(nodeId, version);
            var commonAttributes = node.CommonAttributes("Common properties");
            var generalAttributes = _modelPartDatabaseReader.GetIfcNodeAttributes(nodeId, version);
            return generalAttributes.Concat(new[] { commonAttributes }).ToArray();
        }

        public void Initialize()
        {
            if (_isInitialized && _modelPartDatabaseReader != null)
                return;

            InitializeCache();

            _isInitialized = true;
            _modelPartDatabaseReader = new ModelPartDatabaseReader(_modelPartDirectory.GetPartModelPath(), this);

            //InitializeRemarks();
            //InitializeRelations();
        }

        public Guid Id { get; }
        public string ModelPartName { get; }
        public bool IsIfc { get; }

        public void DropCache(bool restore = false)
        {
            _modelPartDatabaseReader?.Dispose();
            _modelPartDirectory.Clear();

            if (restore)
                _modelPartDatabaseReader = new ModelPartDatabaseReader(_modelPartDirectory.GetPartModelPath(), this);
        }

        public void Dispose()
        {
            _modelPartDatabaseReader?.Dispose();
        }

        public async Task<IList<IfcNode>> GetNodes(DateTime versionFrom, DateTime versionTo, CancellationToken token)
        {
            var nodesToLoad = _modelPartDatabaseReader.GetNodesCount(versionFrom, versionTo);
            var step = Math.Max(1000, nodesToLoad / 5);
            var nodeList = new List<IfcNode>();
            var tasks = _modelPartDatabaseReader.GetIfcNodesByVersion(versionFrom, versionTo)
                .Batch(step)
                .Select(nodes => Task.Run(() =>
                {
                    nodeList.AddRange(nodes);
                }, token));

            await Task.WhenAll(tasks);
            return nodeList;
        }

        //wraped on Task because of concurent init purpose, dont block nodes init
        public async Task<IList<Tessellation>> GetTessellations(DateTime versionFrom, DateTime versionTo, CancellationToken token)
        {
            var nodesToLoad = _modelPartDatabaseReader.GetNodesCount(versionFrom, versionTo);
            var tessellations = new List<Tessellation>();
            var tessStep = Math.Max(500, nodesToLoad / 5);

            var tasks = _modelPartDatabaseReader.GetTessellations(versionFrom, versionTo)
                .Batch(tessStep)
                .Select(data => Task.Run(() =>
                {
                    tessellations.AddRange(data);
                }, token));

            await Task.WhenAll(tasks);
            return tessellations;
        }

        private void InitializeCache()
        {
            var modelPartDatabase = _modelPartDirectory.GetPartModelPath();
            var databaseMerger = new BimDatabaseMerger();

            using (var modelPartCacheWriter = databaseMerger.ValidateCache(modelPartDatabase, this))
            {
                var nodeVersion = modelPartCacheWriter.GetLatestNodeVersion();

                foreach (var version in _versions)
                {
                    databaseMerger.Merge(InitFile(version.File, nodeVersion), modelPartCacheWriter, this);
                }

                modelPartCacheWriter.CreateIndexes();
            }
        }

        private string InitFile(INFile file, DateTime actualNodeVersionInDatabase)
        {
            var destination = _modelPartDirectory.GetFileToMergePath(file);

            var currentFileVersion = DateTime.ParseExact(file.Created.ToString(ModelPartSqlConstants.DATE_FORMAT),
                ModelPartSqlConstants.DATE_FORMAT, CultureInfo.InvariantCulture);

            if (DateTime.Compare(currentFileVersion, actualNodeVersionInDatabase) <= 0)
                return string.Empty;

            var filename = _fileLoader.Download(file);
            using var stream = File.OpenRead(filename);
            using var fileStream = new FileStream(destination, FileMode.Create, FileAccess.ReadWrite, FileShare.ReadWrite);
            
            stream.Seek(0, SeekOrigin.Begin);
            stream.CopyTo(fileStream);

            return destination;
        }

        public IfcNode GetIfcNode(Guid nodeId, DateTime version)
        {
            return _modelPartDatabaseReader.GetNode(nodeId, version);
        }
    }
}
