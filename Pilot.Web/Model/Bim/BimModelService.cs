using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Pilot.Web.Model.Bim.Database.ModelPart;
using Pilot.Web.Model.FileStorage;

namespace Pilot.Web.Model.Bim
{
    public interface IBimModelService
    {
        Task<IList<Tessellation>> GetTessellationsAsync(Guid modelPartId, Guid fileId, long size, IFileLoader fileLoader);
        Task<IList<IfcNode>> GetNodesAsync(Guid modelPartId, Guid fileId, long size, IFileLoader fileLoader);
    }

    class BimModelService: IBimModelService
    {
        private readonly IFilesStorage _filesStorage;

        public BimModelService(IFilesStorage filesStorage)
        {
            _filesStorage = filesStorage;
        }

        public async Task<IList<Tessellation>> GetTessellationsAsync(Guid modelPartId, Guid fileId, long size, IFileLoader fileLoader)
        {
            
            var filename = _filesStorage.GetFilePath(fileId);
            await PutFileInArchive(fileId, size, filename, fileLoader);

            using var databaseReader = new ModelPartDatabaseReader(filename, modelPartId);
            var tessellations = databaseReader.GetTessellationsToCompare(DateTime.MinValue, DateTime.MaxValue);
            return tessellations.ToList();
        }

        public async Task<IList<IfcNode>> GetNodesAsync(Guid modelPartId, Guid fileId, long size, IFileLoader fileLoader)
        {
            var filename = _filesStorage.GetFilePath(fileId);
            await PutFileInArchive(fileId, size, filename, fileLoader);

            using var databaseReader = new ModelPartDatabaseReader(filename, modelPartId);
            var ifcNodes = databaseReader.GetIfcNodesByVersion(DateTime.MinValue, DateTime.MaxValue);
            return ifcNodes.ToList();
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
