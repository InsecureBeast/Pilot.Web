using System.Collections.Generic;
using System.Linq;
using Ascon.Pilot.DataClasses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pilot.Web.Model;
using Pilot.Web.Model.CommonSettings;
using Pilot.Web.Model.DataObjects;
using Pilot.Web.Tools;

namespace Pilot.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MetadataController : ControllerBase
    {
        private readonly IContextService _contextService;

        public MetadataController(IContextService contextService)
        {
            _contextService = contextService;
        }

        [Authorize]
        [HttpGet("[action]")]
        public INMetadata GetMetadata()
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            return api.GetMetadata();
        }

        [Authorize]
        [HttpGet("[action]")]
        public DDatabaseInfo GetDatabaseInfo() 
        { 
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            return api.GetDatabaseInfo();
        }

        [Authorize]
        [HttpGet("[action]")]
        public ICommonSettings GetPersonalSettings(string key)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            return api.GetPersonalSettings(key);
        }

        [Authorize]
        [HttpGet("[action]")]
        public IList<INPerson> GetPeople()
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            return api.GetPeople().Values.ToList();
        }

        [Authorize]
        [HttpGet("[action]")]
        public IList<INOrganisationUnit> GetOrganizationUnits()
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            return api.GetOrganizationUnits().Values.ToList();
        }

        [Authorize]
        [HttpGet("[action]")]
        public INPerson GetCurrentPerson()
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            return api.GetCurrentPerson();
        }

        [Authorize]
        [HttpGet("[action]")]
        public IList<PUserState> GetUserStates()
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            return api.GetUserStates().Select(s => new PUserState(s)).ToList();
        }
    }
}
