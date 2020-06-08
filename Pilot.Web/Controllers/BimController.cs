using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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
        public Task<IList<Tessellation>> GetTessellations(string modelPartId, string fileId, long size)
        {
            var fileGuid = Guid.Parse(fileId);
            var modelPartGuid = Guid.Parse(modelPartId);
            var actor = HttpContext.GetTokenActor();
            return _bimModelService.GetTessellationsAsync(modelPartGuid, fileGuid, size, actor);
        }

        [Authorize]
        [HttpGet("[action]")]
        public Task<IList<IfcNode>> GetNodes(string modelPartId, string fileId, long size)
        {
            var fileGuid = Guid.Parse(fileId);
            var modelPartGuid = Guid.Parse(modelPartId);
            var actor = HttpContext.GetTokenActor();
            return _bimModelService.GetNodesAsync(modelPartGuid, fileGuid, size, actor);
        }
    }
}
