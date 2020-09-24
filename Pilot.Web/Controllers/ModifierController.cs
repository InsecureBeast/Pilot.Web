using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ascon.Pilot.DataClasses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pilot.Web.Model;
using Pilot.Web.Model.DataObjects;
using Pilot.Web.Model.ModifyData;
using Pilot.Web.Tools;

namespace Pilot.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ModifierController : ControllerBase
    {
        private readonly IContextService _contextService;

        public ModifierController(IContextService contextService)
        {
            _contextService = contextService;
        }

        [Authorize]
        [HttpPost("[action]")]
        public ActionResult Change([FromBody] Change[] changes)
        {
            var actor = HttpContext.GetTokenActor();
            var api = _contextService.GetServerApi(actor);
            var modifier = api.NewModifier();
            foreach (var change in changes)
            {
                if (!Guid.TryParse(change.ObjectId, out var id))
                    continue;

                var builder = modifier.EditObject(id);
                foreach (var changeAttribute in change.Attributes.Changed)
                {
                    builder.SetAttribute(changeAttribute.Name, changeAttribute.Value.ToDValue());
                }
                foreach (var attributeChange in change.Attributes.Removed)
                {
                    builder.RemoveAttribute(attributeChange.Name);
                }
            }

            if (modifier.AnyChanges())
                modifier.Apply();

            return Ok();
        }

        
    }
}
