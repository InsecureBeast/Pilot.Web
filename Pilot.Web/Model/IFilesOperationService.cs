using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using Ascon.Pilot.Common;
using Ascon.Pilot.DataClasses;
using Pilot.Web.Model.DataObjects;

namespace Pilot.Web.Model
{
    public interface IFilesOperationService
    {
        byte[] CompressObjectsToArchive(IEnumerable<PObject> objects, string actor);
    }

    class FilesOperationService : IFilesOperationService
    {
        private readonly IContextService _contextService;

        public FilesOperationService(IContextService contextService)
        {
            _contextService = contextService;
        }

        public byte[] CompressObjectsToArchive(IEnumerable<PObject> objects, string actor)
        {
            var api = _contextService.GetServerApi(actor);
            var loader = _contextService.GetFileLoader(actor);

            using (var compressedFileStream = new MemoryStream())
            {
                using (var zipArchive = new ZipArchive(compressedFileStream, ZipArchiveMode.Update, true))
                {
                    AddObjectsToArchive(api, loader, objects, zipArchive, "");
                }

                var data = compressedFileStream.ToArray();
                return data;
            }
        }

        private void AddObjectsToArchive(IServerApiService apiService, IFileLoader fileLoader, IEnumerable<PObject> objects, ZipArchive archive, string currentPath)
        {
            var stack = new Stack<PObject>();
            foreach (var child in objects)
            {
                stack.Push(child);
            }

            while (stack.Any())
            {
                var pObject = stack.Pop();
                if (pObject.Children.Any())
                {
                    var childrenIds = pObject.Children.Select(c => c.ObjectId).ToArray();
                    var children = apiService.GetObjects(childrenIds);
                    foreach (var child in children)
                    {
                        stack.Push(child);
                    }
                }

                if (pObject.Type.HasFiles)
                {
                    INFile dFile = null;
                    string entryName;
                    if (pObject.Type.Name == SystemTypes.PROJECT_FILE)
                    {
                        dFile = pObject.ActualFileSnapshot.Files.FirstOrDefault(f => !FileExtensionHelper.IsSystemFile(f.Name));
                        if (dFile == null)
                            continue;

                        entryName = dFile.Name;
                    }
                    else
                    {
                        dFile = pObject.ActualFileSnapshot.Files.FirstOrDefault(f => FileExtensionHelper.IsXpsAlike(f.Name) || FileExtensionHelper.IsPdfAlike(f.Name));
                        if (dFile == null)
                            continue;

                        entryName = $"{pObject.Title}{Path.GetExtension(dFile.Name)}";
                    }

                    var fileBody = fileLoader.Download(dFile.Id, dFile.Size);
                    if (archive.Entries.Any(x => x.Name == entryName))
                        entryName += " Conflicted";

                    var zipEntry = archive.CreateEntry(Path.Combine(currentPath, entryName), CompressionLevel.NoCompression);

                    //Get the stream of the attachment
                    using (var originalFileStream = new MemoryStream(fileBody))
                    using (var zipEntryStream = zipEntry.Open())
                    {
                        //Copy the attachment stream to the zip entry stream
                        originalFileStream.CopyTo(zipEntryStream);
                    }
                }
                //else
                //{
                //    var directoryPath = Path.Combine(currentPath, dir.Title);
                //    if (archive.Entries.Any(x => x.Name == dir.Title))
                //        directoryPath += " Conflicted";

                //    var entry = archive.GetEntry(currentPath);
                //    entry?.Archive?.CreateEntry(directoryPath);
                //}
            }
        }
    }
}
