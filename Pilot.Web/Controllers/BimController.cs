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
        public IEnumerable<Tessellation> GetFileTessellations(string modelPartId, string fileId, long size)
        {
            var guid = Guid.Parse(fileId);
            var actor = HttpContext.GetTokenActor();
            var fileLoader = _contextService.GetFileLoader(actor);
            var bytes = fileLoader.Download(guid, size);

            if (!Directory.Exists("D:\\webBimTest"))
                Directory.CreateDirectory("D:\\webBimTest");

            var tempFile = "D:\\webBimTest\\" + fileId;
            System.IO.File.WriteAllBytes(tempFile, bytes);
            using (var databaseReader = new ModelPartDatabaseReader(tempFile, Guid.Parse(modelPartId)))
            {
                var tessellations = databaseReader.GetTessellationsToCompare(DateTime.MinValue, DateTime.MaxValue);
                var res = JsonConvert.SerializeObject(tessellations);
                return tessellations.ToList();
            }
        }
    }
}
