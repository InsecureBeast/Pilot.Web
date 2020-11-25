using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using log4net;
using Pilot.Xps.Entities;

namespace Pilot.Web.Model
{
    public interface IFileDownloadService
    {
        byte[] Download(Guid documentId, string actor);
    }

    class FileDownloadService : IFileDownloadService
    {
        private readonly IContextService _contextService;
        private readonly ILog _logger = LogManager.GetLogger(typeof(FileDownloadService));

        public FileDownloadService(IContextService contextService)
        {
            _contextService = contextService;
        }

        public byte[] Download(Guid documentId, string actor)
        {
            try
            {
                var serverApiService = _contextService.GetServerApi(actor);
                var xpsServiceApi = serverApiService.GetServerCommandProxy<IXpsServiceApi>(XpsServerConstants.XpsServiceName);
                var bytes = xpsServiceApi?.MergeXpsDocument(documentId);
                return bytes;
            }
            catch (Exception e)
            {
                _logger.Error(e.Message, e);
                return null;
            }
        }
    }
}
