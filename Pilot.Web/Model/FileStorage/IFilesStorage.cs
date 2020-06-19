using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Ascon.Pilot.Transport;

namespace Pilot.Web.Model.FileStorage
{
    public interface IFilesStorage
    {
        Task PutThumbnailAsync(Guid id, byte[] buffer);
        Task PutFilesAsync(Guid id, List<byte[]> pages);
        Task PutFileAsync(Guid id, byte[] bytes);

        byte[] GetThumbnail(Guid id);
        byte[] GetImageFile(Guid id, int page);
        IEnumerable<byte[]> GetPages(Guid fileId);
        string GetFilePath(Guid id);
    }

    class FilesStorage : IFilesStorage
    {
        private readonly IFileStorageDirectoryProvider _directoryProvider;
        private readonly object _lock = new object();

        public FilesStorage(IFileStorageDirectoryProvider directoryProvider)
        {
            _directoryProvider = directoryProvider;
        }

        public Task PutThumbnailAsync(Guid id, byte[] buffer)
        {
            return Task.Factory.StartNew(() =>
            {
                lock (_lock)
                {
                    var filename = _directoryProvider.GetThumbnailPath(id);
                    Save(buffer, filename);
                }
            });
        }

        public Task PutFilesAsync(Guid id, List<byte[]> pages)
        {
            return Task.Factory.StartNew(() =>
            {
                lock (_lock)
                {
                    for (var i = 0; i < pages.Count; i++)
                    {
                        var buffer = pages[i];
                        var filename = _directoryProvider.GetImagePath(id, i);
                        Save(buffer, filename);
                    }
                }
            });
        }

        public Task PutFileAsync(Guid id, byte[] bytes)
        {
            return Task.Factory.StartNew(() =>
            {
                lock (_lock)
                {
                    var filename = _directoryProvider.GetFilePath(id);
                    Save(bytes, filename);
                }
            });
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

        public string GetFilePath(Guid id)
        {
            var filePath = _directoryProvider.GetFilePath(id);
            return filePath;
        }

        private static byte[] ReadFile(string imageFilename)
        {
            using (var fileStream = File.OpenRead(imageFilename))
            {
                return fileStream.ToByteArray();
            }
        }

        private void Save(byte[] bytes, string filename)
        {
            var dir = Path.GetDirectoryName(filename);
            if (!Directory.Exists(dir))
                Directory.CreateDirectory(dir);

            using (var fileStream = File.Create(filename))
            {
                fileStream.Write(bytes, 0, bytes.Length);
            }
        }
    }
}
