using System;
using System.IO;
using System.Linq;
using Ascon.Pilot.Common;
using Ascon.Pilot.DataClasses;
using Ascon.Pilot.DataModifier;
using Ascon.Pilot.Server.Api.Contracts;
using log4net;

namespace Pilot.Web.Model.ModifyData
{
    public interface IChangesetUploader
    {
        void Upload(INChangesetData changeset);
    }

    public class ChangesetUploader : IChangesetUploader
    {
        private const long MIN_RESUME_UPLOAD_FILE_SIZE = 50 * 1024 * 1024;
        private static int CHUNK_SIZE = 1024 * 1024; // 1 Mb
        private readonly IFileArchiveApi _fileArchiveApi;
        private readonly IFileStorageProvider _storageProvider;
        private readonly ILog _logger;
        private readonly long _minResumeUploadFileSize;
        private long _uploaded;

        public ChangesetUploader(IFileArchiveApi fileArchiveApi, IFileStorageProvider storageProvider, ILog logger = null)
        {
            _fileArchiveApi = fileArchiveApi;
            _storageProvider = storageProvider;
            _logger = logger;
            _minResumeUploadFileSize = MIN_RESUME_UPLOAD_FILE_SIZE;
        }

        public void Upload(INChangesetData changeset)
        {
            if (!changeset.Changes.Any())
                return;
            foreach (var id in changeset.NewFileBodies)
            {
                var body = FindFileBody(id, changeset);
                CreateFile(body);
            }
        }

        private INFile FindFileBody(Guid id, INChangesetData changeset)
        {
            foreach (var change in changeset.Changes)
            {
                var file = change.New.ActualFileSnapshot.Files
                    .Union(change.New.PreviousFileSnapshots.SelectMany(x => x.Files))
                    .FirstOrDefault(x => x.Id == id);

                if (file != null)
                    return file;
            }
            throw new Exception(string.Format("Not found file body for id {0}", id));
        }

        private void CreateFile(INFile file)
        {
            long pos = 0;
            if (file.Size > _minResumeUploadFileSize)
            {
                //опросить сервер о состоянии этого файла
                pos = _fileArchiveApi.GetFilePosition(file.Id);
                if (pos > file.Size)
                    throw new Exception(string.Format("File with id {0} is corrupted", file.Id));
            }

            // учтем в прогрессе уже загруженные данные
            _uploaded += pos;

            //отправим тело на сервер
            using (var fs = _storageProvider.Open(file.Id))
            {
                if (file.Size != fs.Length)
                    throw new Exception(string.Format("Local file size is incorrect: {0}", file.Id));

                const int MAX_ATTEMPT_COUNT = 5;
                int attemptCount = 0;
                bool succeed = false;
                do
                {
                    UploadData(fs, file.Id, pos);
                    try
                    {
                        _fileArchiveApi.PutFileInArchive(file.Dto.Body);
                        succeed = true;
                    }
                    catch (Exception e)
                    {
                        _logger?.Error("an error occurred while uploading the file", e);
                        pos = 0;
                        _uploaded = 0;
                    }
                    attemptCount++;
                } while (!succeed && attemptCount < MAX_ATTEMPT_COUNT);

                if (!succeed)
                    throw new PilotException(string.Format("Unable to upload file {0}", file.Id));
            }
        }

        private void UploadData(Stream fs, Guid id, long pos)
        {
            if (fs.Length == 0)
            {
                _fileArchiveApi.PutFileChunk(id, new byte[0], 0);
                _logger?.InfoFormat("Progress of uploading file {0}", id);
                return;
            }

            var chunkSize = CHUNK_SIZE;
            var buffer = new byte[chunkSize];

            fs.Seek(pos, SeekOrigin.Begin);
            while (pos < fs.Length)
            {
                var readBytes = fs.Read(buffer, 0, chunkSize);
                _fileArchiveApi.PutFileChunk(id, TrimBuffer(buffer, readBytes), pos);

                pos += readBytes;
                _uploaded += readBytes;

                _logger?.InfoFormat("Progress [{1}] of uploading file {0}", id, _uploaded);
            }
        }

        private byte[] TrimBuffer(byte[] buffer, int size)
        {
            if (size < buffer.Length)
            {
                var trimmed = new byte[size];
                Array.Copy(buffer, trimmed, size);
                return trimmed;
            }
            return buffer;
        }
    }
}
