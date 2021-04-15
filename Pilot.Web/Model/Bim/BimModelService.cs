using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ascon.Pilot.BimUtils;
using Ascon.Pilot.BimUtils.Database;
using Pilot.Web.Model.Bim.Model;
using Pilot.Web.Model.FileStorage;

namespace Pilot.Web.Model.Bim
{
    public interface IBimModelService
    {
        Task<IList<Tessellation>> GetTessellationsAsync(Guid modelPartId, IFileLoader fileLoader, IServerApiService serverApiService);
        Task<IList<IfcNode>> GetNodesAsync(Guid modelPartId, IFileLoader fileLoader, IServerApiService serverApiService);
        IList<ElementPropertySet> GetNodeProperties(Guid modelPartId, Guid nodeId, IFileLoader fileLoader, IServerApiService serverApiService);
    }

    class BimModelService: IBimModelService
    {
        private readonly IFilesStorage _filesStorage;

        public BimModelService(IFilesStorage filesStorage)
        {
            _filesStorage = filesStorage;
        }

        public Task<IList<Tessellation>> GetTessellationsAsync(Guid modelPartId, IFileLoader fileLoader, IServerApiService serverApiService)
        {
            //var filename = _filesStorage.GetFilePath(fileId);
            //await PutFileInArchive(fileId, size, filename, fileLoader);

            var databaseId = serverApiService.GetDatabaseInfo().DatabaseId;
            var modelPart = new BimModelPart(databaseId, modelPartId, serverApiService, fileLoader);
            modelPart.Initialize();
            var tessellations = modelPart.GetTessellations(DateTime.MinValue, DateTime.MaxValue, CancellationToken.None);
            return tessellations;
        }

        public Task<IList<IfcNode>> GetNodesAsync(Guid modelPartId, IFileLoader fileLoader, IServerApiService serverApiService)
        {
            var databaseId = serverApiService.GetDatabaseInfo().DatabaseId;
            var modelPart = new BimModelPart(databaseId, modelPartId, serverApiService, fileLoader);
            modelPart.Initialize();
            var nodes = modelPart.GetNodes(DateTime.MinValue, DateTime.MaxValue, CancellationToken.None);
            return nodes;

            //var filename = _filesStorage.GetFilePath(fileId);
            //await PutFileInArchive(fileId, size, filename, fileLoader);

            //using var databaseReader = new ModelPartDatabaseReader(filename, modelPartId);
            //var ifcNodes = databaseReader.GetIfcNodesByVersion(DateTime.MinValue, DateTime.MaxValue);
            //return (IList<IfcNode>)ifcNodes.ToList();
        }

        public IList<ElementPropertySet> GetNodeProperties(Guid modelPartId, Guid nodeId, IFileLoader fileLoader, IServerApiService serverApiService)
        {
            var token = new CancellationTokenSource();
            var databaseId = serverApiService.GetDatabaseInfo().DatabaseId;
            var modelPart = new BimModelPart(databaseId, modelPartId, serverApiService, fileLoader);

            modelPart.Initialize();
            var properties = modelPart.GetNodeAttributes(nodeId, DateTime.MaxValue);
            
            //var tempModelPartFilename = modelPart.GetModelPart();
            // TODO Cache
            //await PutFileInArchive(fileId, size, filename, fileLoader);

            //modelPart.DropCache();
            //modelPart.Dispose();

            return properties;
        }

        private async Task PutFileInArchive(Guid fileId, long size, string filename, IFileLoader fileLoader)
        {
            if (!File.Exists(filename))
            {
                var bytes = fileLoader.Download(fileId, size);
                await _filesStorage.PutFileAsync(fileId, bytes);
            }
        }
    }
}
