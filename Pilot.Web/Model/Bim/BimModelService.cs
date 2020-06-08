using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Pilot.Web.Model.Bim.Database.ModelPart;
using Pilot.Web.Model.FileStorage;

namespace Pilot.Web.Model.Bim
{
    public interface IBimModelService
    {
        Task<IList<Tessellation>> GetTessellationsAsync(Guid modelPartId, Guid fileId, long size, string actor);
        Task<IList<IfcNode>> GetNodesAsync(Guid modelPartId, Guid fileId, long size, string actor);
    }

    class BimModelService: IBimModelService
    {
        private readonly IFilesStorage _filesStorage;
        private readonly IContextService _contextService;

        public BimModelService(IFilesStorage filesStorage, IContextService contextService)
        {
            _filesStorage = filesStorage;
            _contextService = contextService;
        }

        public async Task<IList<Tessellation>> GetTessellationsAsync(Guid modelPartId, Guid fileId, long size, string actor)
        {
            var fileLoader = _contextService.GetFileLoader(actor);
            var file = await _filesStorage.GetFileAsync(fileId, size, fileLoader);

            using var databaseReader = new ModelPartDatabaseReader(file, modelPartId);
            var tessellations = databaseReader.GetTessellationsToCompare(DateTime.MinValue, DateTime.MaxValue);
            return tessellations.ToList();
        }

        public async Task<IList<IfcNode>> GetNodesAsync(Guid modelPartId, Guid fileId, long size, string actor)
        {
            var fileLoader = _contextService.GetFileLoader(actor);
            var file = await _filesStorage.GetFileAsync(fileId, size, fileLoader);

            using var databaseReader = new ModelPartDatabaseReader(file, modelPartId);
            var ifcNodes = databaseReader.GetIfcNodesByVersion(DateTime.MinValue, DateTime.MaxValue);
            return ifcNodes.ToList();
        }
    }
}
