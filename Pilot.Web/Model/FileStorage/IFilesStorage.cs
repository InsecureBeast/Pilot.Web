using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Ascon.Pilot.Transport;

namespace Pilot.Web.Model.FileStorage
{
    public interface IFilesStorage : IFileSaver
    {
        byte[] GetThumbnail(Guid id);
        byte[] GetImageFile(Guid id, int page);
        IEnumerable<byte[]> GetPages(Guid fileId);
    }

    class FilesStorage : IFilesStorage
    {
        private readonly IFileStorageDirectoryProvider _directoryProvider;
        private readonly IFileSaver _fileSaver;
        
        public FilesStorage(IFileStorageDirectoryProvider directoryProvider, IFileSaver fileSaver)
        {
            _directoryProvider = directoryProvider;
            _fileSaver = fileSaver;
        }

        public byte[] GetThumbnail(Guid id)
        {
            var imageFilename = _directoryProvider.GetThumbnailPath(id);
            return !File.Exists(imageFilename) ? null : ReadFile(imageFilename);
        }

        public Task PutThumbnailAsync(Guid id, byte[] buffer)
        {
            return _fileSaver.PutThumbnailAsync(id, buffer);
        }

        public Task PutFilesAsync(Guid id, List<byte[]> pages)
        {
            return _fileSaver.PutFilesAsync(id, pages);
        }

        public byte[] GetImageFile(Guid id, int page)
        {
            var imageFilename = _directoryProvider.GetImagePath(id, page);
            return !File.Exists(imageFilename) ? null : ReadFile(imageFilename);
        }

        public IEnumerable<byte[]> GetPages(Guid fileId)
        {
            var pages = new List<byte[]>();
            var imagesStoreDirectory = _directoryProvider.GetImagesStorageDirectory(fileId);
            if (!Directory.Exists(imagesStoreDirectory))
                return pages;

            var pageFiles = Directory.EnumerateFiles(imagesStoreDirectory);
            foreach (var file in pageFiles)
            {
                if (!File.Exists(file))
                    continue;

                var bytes = ReadFile(file);
                pages.Add(bytes);
            }

            return pages;
        }

        private static byte[] ReadFile(string imageFilename)
        {
            using (var fileStream = File.OpenRead(imageFilename))
            {
                return fileStream.ToByteArray();
            }
        }
    }
}
