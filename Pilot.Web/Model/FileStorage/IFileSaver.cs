using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Pilot.Web.Model.FileStorage
{
    public interface IFileSaver
    {
        Task PutThumbnailAsync(Guid id, byte[] buffer);
        Task PutFilesAsync(Guid id, List<byte[]> pages);
        Task PutFileAsync(Guid id, byte[] bytes);
    }

    internal class FileSaver : IFileSaver
    {
        private readonly IFileStorageDirectoryProvider _directoryProvider;
        private readonly object _lock = new object();

        public FileSaver(IFileStorageDirectoryProvider directoryProvider)
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
