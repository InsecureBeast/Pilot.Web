using System;
using System.IO;
using Ascon.Pilot.DataClasses;
using Ascon.Pilot.Server.Api.Contracts;

namespace Pilot.Web.Model
{
    public interface IFileLoader
    {
        string Download(INFile inFile);
        byte[] Download(Guid fileId, long size);
    }

    class FileLoader : IFileLoader
    {
        private static int CHUNK_SIZE = 1024 * 1024; // 1 Mb

        private readonly IFileArchiveApi _fileArchiveApi;

        public FileLoader(IFileArchiveApi fileArchiveApi)
        {
            _fileArchiveApi = fileArchiveApi;
        }

        public string Download(INFile inFile)
        {
            var filePath = GetTempPath(inFile.Modified.ToFileTimeUtc() + "_" + inFile.Id);
            if (File.Exists(filePath))
                File.Delete(filePath);

            using (BinaryWriter file = new BinaryWriter(File.OpenWrite(filePath)))
            {
                var filePos = _fileArchiveApi.GetFilePosition(inFile.Id);
                long fileSize = inFile.Size;
                while (fileSize > 0)
                {
                    int chunkSize = fileSize > CHUNK_SIZE ? CHUNK_SIZE : (int)fileSize;
                    var data = _fileArchiveApi.GetFileChunk(inFile.Id, filePos + inFile.Size - fileSize, chunkSize);
                    file.Write(data);
                    fileSize -= chunkSize;
                }
                file.Close();
            }

            return filePath;
        }

        public byte[] Download(Guid fileId, long size)
        {
            using (var stream = new MemoryStream())
            using (BinaryWriter file = new BinaryWriter(stream))
            {
                var filePos = _fileArchiveApi.GetFilePosition(fileId);
                long fileSize = size;
                while (fileSize > 0)
                {
                    int chunkSize = fileSize > CHUNK_SIZE ? CHUNK_SIZE : (int)fileSize;
                    var data = _fileArchiveApi.GetFileChunk(fileId, filePos + size - fileSize, chunkSize);
                    file.Write(data);
                    fileSize -= chunkSize;
                }

                return stream.ToArray();
            }
        }

        private static string GetTempPath(string fileName)
        {
            return Path.Combine(DirectoryProvider.GetTempDirectory(), fileName);
        }
    }
}
