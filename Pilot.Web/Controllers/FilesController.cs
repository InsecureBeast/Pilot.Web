using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Ascon.Pilot.DataModifier;
using DocumentRender;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Pilot.Web.Model;
using Pilot.Web.Model.FileStorage;
using Pilot.Web.Tools;

namespace Pilot.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly IContextService _contextService;
        private readonly IDocumentRender _documentRender;
        private readonly IFileStorageProvider _fileStorageProvider;
        private readonly IOptions<AppSettings> _options;
        private readonly IFilesStorage _filesStorage;
        private readonly IFileSaver _fileSaver;
        private readonly IFilesOperationService _filesOperationService;

        public FilesController(
            IContextService contextService, 
            IDocumentRender documentRender, 
            IFilesStorage filesStorage, 
            IFileSaver fileSaver, 
            IFilesOperationService filesOperationService, 
            IFileStorageProvider fileStorageProvider,
            IOptions<AppSettings> options)
        {
            _contextService = contextService;
            _documentRender = documentRender;
            _fileStorageProvider = fileStorageProvider;
            _options = options;
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

            var actor = _contextService.GetTokenActor(HttpContext);
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
            var actor = _contextService.GetTokenActor(HttpContext);
            var fileLoader = _contextService.GetFileLoader(actor);
            var bytes = fileLoader.Download(guid, size);
            return File(bytes, "application/octet-stream");
        }

        [Authorize]
        [HttpGet("[action]")]
        public ActionResult GetDocumentFile(string documentId)
        {
            var guid = Guid.Parse(documentId);
            var actor = _contextService.GetTokenActor(HttpContext);
            var bytes = _filesOperationService.DownloadFile(guid, actor);
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

            var actor = _contextService.GetTokenActor(HttpContext);
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

            var actor = _contextService.GetTokenActor(HttpContext);
            var api = _contextService.GetServerApi(actor);
            
            var list = ids.Select(Guid.Parse).ToArray();
            var objects = api.GetObjects(list);

            var data = _filesOperationService.CompressObjectsToArchive(objects, actor);
            return File(data, "application/octet-stream");
        }

        /// <summary>
        /// Загрузка файлов на сервер
        /// </summary>
        /// <param name="parentId"></param>
        /// <returns></returns>
        [Authorize]
        [HttpPost("[action]/{parentId}")]
        [DisableRequestSizeLimit]
        public ActionResult<Guid[]> UploadFiles(Guid parentId)
        {
            const string fileTitleAttribute = "Title 4C281306-E329-423A-AF45-7B39EC30273F";
            
            try
            {
                if (Request.Form.Files.Count == 0)
                {
                    return BadRequest("There are not files");
                }
                
                if (IsBadFileExtensions(Request.Form.Files))
                {
                    return BadRequest("Bad file extension");
                }
            
                var actor = HttpContext.GetTokenActor();
                var api = _contextService.GetServerApi(actor);
            
                var parent = api.GetObjects(new []{parentId})?.FirstOrDefault();
                if (parent == null)
                {
                    throw new Exception("Parent is not found");
                }

                if (!parent.Type.IsMountable && parent.Type.Name != "Project_folder")
                {
                    throw new Exception("Parent is not mountable");
                }

                var fileType = api.GetMetadata().Types.FirstOrDefault(t => t.Name == "File");
                if (fileType == null)
                {
                    throw new Exception("File type is not found");
                }

                var existingFileObjectIds = parent.Children
                    .Where(c => c.TypeId == fileType.Id)
                    .Select(c => c.ObjectId)
                    .ToArray();

                var existingFileNames = new HashSet<string>(
                    api.GetObjects(existingFileObjectIds)
                        .Select(o => o.Attributes.TryGetValue(fileTitleAttribute, out var title) ? title as string : null)
                        .Where(t => !string.IsNullOrEmpty(t)));

                var result = new Guid[Request.Form.Files.Count];
                var modifier = api.NewModifier();
                var i = 0;
                foreach (var formFile in Request.Form.Files)
                {
                    var fileName = existingFileNames.Contains(formFile.Name) 
                        ? $"{Path.GetFileNameWithoutExtension(formFile.Name)} [{DateTime.Now:yyyy-MM-dd HH-mm-ss}]{Path.GetExtension(formFile.Name)}"
                        : formFile.Name;
                    
                    var newObjectId = Guid.NewGuid();
                    var builder = modifier.CreateObject(newObjectId, parentId, fileType.Id);
                    builder.SetAttribute(fileTitleAttribute, fileName);
                    builder.AddFile(
                        new DocumentInfo(formFile.Name, formFile.OpenReadStream, DateTime.Now, DateTime.Now,
                            DateTime.Now), _fileStorageProvider);
                    result[i++] = modifier.Apply();
                }
                    
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("[action]")]
        public double GetDisplacementFactor()
        {
            var factor = _options.Value.DisplacementFactor;
            if (factor == 0)
                return 1;

            return factor;
        }

        /// <summary>
        /// Проверка расширения документа на допустимое к загрузке и скачиванию
        /// </summary>
        /// <param name="fileCollection">список загружаемых файлов</param>
        /// <returns></returns>
        private static bool IsBadFileExtensions(IFormFileCollection fileCollection)
        {
            var badExtensions = new List<string>()
            {
                ".exe",
                ".cmd",
                ".com",
                ".vbs",
                ".dll"
            };
            
            foreach (var file in fileCollection)
            {
                if (!badExtensions.Any(file.FileName.Contains))
                {
                    continue;
                }
                
                return true;
            }

            return false;
        }
    }
}
