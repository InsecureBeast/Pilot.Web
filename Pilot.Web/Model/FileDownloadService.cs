using System;

namespace Pilot.Web.Model
{
    public interface IFileDownloadService
    {
        byte[] Download(Guid documentId, string actor);
    }

    class FileDownloadService : IFileDownloadService
    {
        private readonly IContextService _contextService;

        public FileDownloadService(IContextService contextService)
        {
            _contextService = contextService;
        }

        public byte[] Download(Guid documentId, string actor)
        {
            var serverApiService = _contextService.GetServerApi(actor);
            var xpsServiceApi = _contextService.GetExternalXpsServiceApi(serverApiService);
            var bytes = xpsServiceApi.MergeXpsDocument(documentId);
            return bytes;
        }
    }
}
