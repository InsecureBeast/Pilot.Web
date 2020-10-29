using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Pilot.Xps.Entities;

namespace Pilot.Web.Model
{
    public interface IXpsFileDownloadService
    {
        byte[] Download(Guid documentId, string actor);
    }
    class XpsFileDownloadService : IXpsFileDownloadService
    {
        private readonly IContextService _contextService;

        public XpsFileDownloadService(IContextService contextService)
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
                return null;
            }
        }
    }
}
