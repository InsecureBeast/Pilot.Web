using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Ascon.Pilot.Transport;

namespace Pilot.Web.Model.FileStorage
{
    public interface IFilesStorage
    {
        byte[] GetThumbnail(Guid id);
        byte[] GetImageFile(Guid id, int page);
        IEnumerable<byte[]> GetPages(Guid fileId);
        Task<string> GetFileAsync(Guid id, long size, IFileLoader fileLoader);
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

        public async Task<string> GetFileAsync(Guid id, long size, IFileLoader fileLoader)
        {
            var filePath = _directoryProvider.GetFilePath(id);
            if (!File.Exists(filePath))
            {
                var bytes = fileLoader.Download(id, size);
                await _fileSaver.PutFileAsync(id, bytes);
            }

            return filePath;
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
