using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pilot.Web.Model;
using Pilot.Web.Model.DataObjects;
using Pilot.Web.Tools;

namespace Pilot.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly IContextService _contextService;

        public DocumentsController(IContextService contextService)
        {
            _contextService = contextService;
        }

        [Authorize]
        [HttpGet("[action]")]
        public IEnumerable<PObject> GetDocuments(Guid[] ids)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            return api.GetObjects(ids);
        }

        [Authorize]
        [HttpPost("[action]")]
        public IEnumerable<PObject> GetObjects([FromBody] string[] ids)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var guids = ids.Select(Guid.Parse);
            return api.GetObjects(guids.ToArray());
        }

        [Authorize]
        [HttpGet("[action]")]
        public IEnumerable<PObject> GetDocumentChildren(string id, int childrenType)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var guid = Guid.Parse(id);
            return api.GetObjectChildren(guid, (ChildrenType)childrenType);
        }

        [Authorize]
        [HttpGet("[action]")]
        public PObject GetObject(string id)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var guid = Guid.Parse(id);

            var objs = api.GetObjects(new[] { guid });
            var current = objs.FirstOrDefault();
            return current;
        }

        [Authorize]
        [HttpGet("[action]")]
        public IEnumerable<PObject> GetDocumentParents(string id)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var guid = Guid.Parse(id);

            var parents = api.GetObjectParents(guid);
            return parents;
        }
    }
}
