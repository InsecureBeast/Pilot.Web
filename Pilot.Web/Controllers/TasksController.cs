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
    public class TasksController : ControllerBase
    {
        private readonly IContextService _contextService;

        public TasksController(IContextService contextService)
        {
            _contextService = contextService;
        }

        [Authorize]
        [HttpPost("[action]")]
        public Task<IEnumerable<PObject>> GetTasks([FromBody] string filter)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            return api.GetTasksAsync(filter);
        }
    }
}
