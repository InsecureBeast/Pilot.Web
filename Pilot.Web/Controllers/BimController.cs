using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Ascon.Pilot.BimUtils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pilot.Web.Model;
using Pilot.Web.Model.Bim;
using Pilot.Web.Tools;

namespace Pilot.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BimController : ControllerBase
    {
        private readonly IContextService _contextService;
        private readonly IBimModelService _bimModelService;

        public BimController(IContextService contextService, IBimModelService bimModelService)
        {
            _contextService = contextService;
            _bimModelService = bimModelService;
        }

        [Authorize]
        [HttpGet("[action]")]
        public Task<IList<Tessellation>> GetTessellations(string modelPartId)
        {
            var modelPartGuid = Guid.Parse(modelPartId);
            var actor = HttpContext.GetTokenActor();
            var fileLoader = _contextService.GetFileLoader(actor);
            var serverApi = _contextService.GetServerApi(actor);
            return _bimModelService.GetTessellationsAsync(modelPartGuid, fileLoader, serverApi);
        }

        [Authorize]
        [HttpGet("[action]")]
        public Task<IList<IfcNode>> GetNodes(string modelPartId)
        {
            var modelPartGuid = Guid.Parse(modelPartId);
            var actor = HttpContext.GetTokenActor();
            var fileLoader = _contextService.GetFileLoader(actor);
            var serverApi = _contextService.GetServerApi(actor);
            return _bimModelService.GetNodesAsync(modelPartGuid, fileLoader, serverApi);
        }

        [Authorize]
        [HttpGet("[action]")]
        public IList<ElementPropertySet> GetNodeProperties(string modelPartId, string nodeId)
        {
            var nodeGuid = Guid.Parse(nodeId);
            var modelPartGuid = Guid.Parse(modelPartId);
            var actor = HttpContext.GetTokenActor();
            var fileLoader = _contextService.GetFileLoader(actor);
            var serverApi = _contextService.GetServerApi(actor);
            return _bimModelService.GetNodeProperties(modelPartGuid, nodeGuid, fileLoader, serverApi);
        }
    }
}
