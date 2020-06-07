using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Pilot.Web.Model;
using Pilot.Web.Model.Bim;
using Pilot.Web.Model.Bim.Database.ModelPart;
using Pilot.Web.Model.DataObjects;
using Pilot.Web.Tools;

namespace Pilot.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BimController : ControllerBase
    {
        private readonly IContextService _contextService;

        public BimController(IContextService contextService)
        {
            _contextService = contextService;
        }

        [Authorize]
        [HttpGet("[action]")]
        public IEnumerable<Tessellation> GetTessellations(string modelPartId, string fileId, long size)
        {
            var guid = Guid.Parse(fileId);

            if (!Directory.Exists("D:\\webBimTest"))
                Directory.CreateDirectory("D:\\webBimTest");

            var tempFile = "D:\\webBimTest\\" + fileId;
            if (!System.IO.File.Exists(tempFile))
            {
                var actor = HttpContext.GetTokenActor();
                var fileLoader = _contextService.GetFileLoader(actor);
                var bytes = fileLoader.Download(guid, size);
                System.IO.File.WriteAllBytes(tempFile, bytes);
            }

            using (var databaseReader = new ModelPartDatabaseReader(tempFile, Guid.Parse(modelPartId)))
            {
                var tessellations = databaseReader.GetTessellationsToCompare(DateTime.MinValue, DateTime.MaxValue);
                return tessellations.ToList();
            }
        }

        [Authorize]
        [HttpGet("[action]")]
        public IEnumerable<IfcNode> GetNodes(string modelPartId, string fileId, long size)
        {
            var guid = Guid.Parse(fileId);
            
            if (!Directory.Exists("D:\\webBimTest"))
                Directory.CreateDirectory("D:\\webBimTest");

            var tempFile = "D:\\webBimTest\\" + fileId;
            if (!System.IO.File.Exists(tempFile))
            {
                var actor = HttpContext.GetTokenActor();
                var fileLoader = _contextService.GetFileLoader(actor);
                var bytes = fileLoader.Download(guid, size);
                System.IO.File.WriteAllBytes(tempFile, bytes);
            }

            using (var databaseReader = new ModelPartDatabaseReader(tempFile, Guid.Parse(modelPartId)))
            {
                var ifcNodes = databaseReader.GetIfcNodesByVersion(DateTime.MinValue, DateTime.MaxValue);
                return ifcNodes.ToList();
            }
        }
    }
}
