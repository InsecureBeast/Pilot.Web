using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pilot.Web.Model;
using Pilot.Web.Model.DataObjects;
using Pilot.Web.Tools;

namespace Pilot.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly IContextService _contextService;

        public SearchController(IContextService contextService)
        {
            _contextService = contextService;
        }

        [Authorize]
        [HttpGet("[action]")]
        public async Task<IList<PObject>> SearchObjects(string searchRequest, bool isContextSearch, string contextObjectId)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var searchService = api.GetSearchService();
            var contextObjectGuid = Guid.Parse(contextObjectId);
            var searchResult = await searchService.SearchObjects(searchRequest, isContextSearch, contextObjectGuid);

            if (searchResult.Found == null)
                return Array.Empty<PObject>();

            var objects = api.GetObjects(searchResult.Found.ToArray());
            return objects.ToList();
        }
    }
}
