using System;
using System.IO;
using Microsoft.Extensions.Options;

namespace Pilot.Web.Model.FileStorage
{
    public interface IFileStorageDirectoryProvider
    {
        string GetImagesStorageDirectory(Guid imageFileId);
        string GetThumbnailPath(Guid imageFileId);
        string GetImagePath(Guid imageFileId, int page);
    }

    class FileStorageDirectoryProvider : IFileStorageDirectoryProvider
    {
        private readonly string _tempDirectory;

        public FileStorageDirectoryProvider(IOptions<AppSettings> options)
        {
            var filesStorageDir = options.Value.FilesStorageDirectory;
            _tempDirectory = Path.Combine(filesStorageDir, "storage");
        }
        
        public string GetImagesStorageDirectory(Guid imageFileId)
        {
            var root = Path.Combine(_tempDirectory, "pages");
            var path = DirectoryProvider.GetStoragePath(imageFileId, root);
            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);

            return path;
        }

        public string GetThumbnailPath(Guid imageFileId)
        {
            var root = Path.Combine(_tempDirectory, "thumbs");
            var thumbnailPath = DirectoryProvider.GetStoragePath(imageFileId, root);
            var filename = Path.Combine(thumbnailPath, "thumb.png");
            return filename;
        }

        public string GetImagePath(Guid imageFileId, int page)
        {
            var imageDir = GetImagesStorageDirectory(imageFileId);
            return Path.Combine(imageDir, $"page_{page}.png");
        }
    }
}
