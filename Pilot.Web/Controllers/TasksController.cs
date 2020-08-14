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

        [Authorize]
        [HttpPost("[action]")]
        public Task<IEnumerable<PObject>> GetTaskWithFilter([FromBody] TaskWithFilter filter)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            if (!Guid.TryParse(filter.TaskId, out var taskId))
                return Task.FromResult(Enumerable.Empty<PObject>());

            var result = api.GetTasksWithFilterAsync(filter.Filter, taskId);
            return result;
        }
    }

    public class TaskWithFilter
    {
        public string Filter { get; set; }
        public string TaskId { get; set; }
    }
}
