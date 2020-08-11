using System;
using System.Collections.Generic;
using System.IO;
using Ascon.Pilot.Common.Utils;
using Ascon.Pilot.DataModifier;

namespace Pilot.Web.Model.ModifyData
{
    public interface IFileStorage : IFileStorageProvider
    {
        string CreateFile(Guid fileId);
        void DeleteFile(Guid fileId);
    }

    public class FileStorageProvider : IFileStorage
    {
        private readonly string _fileArchiveFolder;
        private readonly Dictionary<Guid, string> _files = new Dictionary<Guid, string>();

        public FileStorageProvider(string fileArchiveFolder)
        {
            _fileArchiveFolder = fileArchiveFolder;
            if (!Directory.Exists(fileArchiveFolder))
                Directory.CreateDirectory(fileArchiveFolder);
        }

        public Stream Create(Guid fileId)
        {
            var filePath = Path.Combine(_fileArchiveFolder, fileId + ".dat");
            _files[fileId] = filePath;
            return new FileStream(filePath, FileMode.OpenOrCreate);
        }

        public Stream Open(Guid id)
        {
            if (_files.TryGetValue(id, out var path))
                return File.Open(path, FileMode.OpenOrCreate);

            throw new FileNotFoundException("File not found", id.ToString());
        }

        public void ClearActualFileId(Guid objId)
        {
            throw new NotImplementedException();
        }

        public string CreateFile(Guid fileId)
        {
            var filePath = Path.Combine(_fileArchiveFolder, fileId.ToString());
            _files[fileId] = filePath;
            return filePath;
        }

        public void DeleteFile(Guid fileId)
        {
            if (!_files.TryGetValue(fileId, out var path))
                return;

            FileHelper.DeleteFile(path);
            _files.Remove(fileId);
        }
    }
}
