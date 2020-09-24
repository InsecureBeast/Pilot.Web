using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using Ascon.Pilot.Common;
using Ascon.Pilot.DataClasses;
using DocumentRender;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pilot.Web.Model;
using Pilot.Web.Model.DataObjects;
using Pilot.Web.Model.FileStorage;
using Pilot.Web.Tools;

namespace Pilot.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly IContextService _contextService;
        private readonly IHttpContextService _httpContextService;
        private readonly IDocumentRender _documentRender;
        private readonly IFilesStorage _filesStorage;
        private readonly IFileSaver _fileSaver;
        private readonly IFilesOperationService _filesOperationService;

        public FilesController(
            IContextService contextService, 
            IHttpContextService httpContextService, 
            IDocumentRender documentRender, 
            IFilesStorage filesStorage, 
            IFileSaver fileSaver, 
            IFilesOperationService filesOperationService)
        {
            _contextService = contextService;
            _httpContextService = httpContextService;
            _documentRender = documentRender;
            _filesStorage = filesStorage;
            _fileSaver = fileSaver;
            _filesOperationService = filesOperationService;
        }

        [Authorize]
        [HttpGet("[action]")]
        public int GetDocumentPagesCount(string fileId, long size, int scale)
        {
            var guid = Guid.Parse(fileId);
            var pages = _filesStorage.GetPages(guid).ToList();
            if (pages.Any())
                return pages.Count;

            var actor = _httpContextService.GetTokenActor(HttpContext);
            var fileLoader = _contextService.GetFileLoader(actor);
            var file = fileLoader.Download(guid, size);

            pages = _documentRender.RenderPages(file, scale).ToList();
            if (pages.Any())
            {
                _fileSaver.PutFilesAsync(guid, pages);
            }

            return pages.Count;
        }

        [Authorize]
        [HttpGet("[action]")]
        public ActionResult GetDocumentPageContent(string fileId, int page)
        {
            var guid = Guid.Parse(fileId);
            var image = _filesStorage.GetImageFile(guid, page);
            return File(image ?? new byte[0], "image/png");
        }

        [Authorize]
        [HttpGet("[action]")]
        public ActionResult GetFile(string fileId, long size)
        {
            var guid = Guid.Parse(fileId);
            var actor = _httpContextService.GetTokenActor(HttpContext);
            var fileLoader = _contextService.GetFileLoader(actor);
            var bytes = fileLoader.Download(guid, size);
            return File(bytes, "application/octet-stream");
        }

        [Authorize]
        [HttpGet("[action]")]
        public ActionResult GetThumbnail(string fileId, long size)
        {
            var guid = Guid.Parse(fileId);
            var thumbnail = _filesStorage.GetThumbnail(guid);
            if (thumbnail != null)
                return File(thumbnail, "image/png");

            var actor = _httpContextService.GetTokenActor(HttpContext);
            var fileLoader = _contextService.GetFileLoader(actor);
            var fileContent = fileLoader.Download(guid, size);
            thumbnail = _documentRender.RenderPage(fileContent, 1, 0.2);
            if (thumbnail != null)
                _fileSaver.PutThumbnailAsync(guid, thumbnail);

            return File(thumbnail, "image/png");
        }

        [Authorize]
        [HttpPost("[action]")]
        public IActionResult GetFileArchive([FromBody] string[] ids)
        {
            if (ids.Length == 0)
                throw new Exception("ids are empty");

            var actor = _httpContextService.GetTokenActor(HttpContext);
            var api = _contextService.GetServerApi(actor);
            
            var list = ids.Select(Guid.Parse).ToArray();
            var objects = api.GetObjects(list);

            var data = _filesOperationService.CompressObjectsToArchive(objects, actor);
            return File(data, "application/octet-stream");
        }
    }
}