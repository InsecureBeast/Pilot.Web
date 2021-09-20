using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Pilot.Xps.Entities;

namespace Pilot.Web.Model.ExternalServices
{
    public class XpsServiceSafe : IXpsServiceApi
    {
        private readonly IXpsServiceApi _xpsServiceApi;

        public XpsServiceSafe(IServerApiService serverApi)
        {
            _xpsServiceApi = serverApi.GetServerCommandProxy<IXpsServiceApi>(XpsServerConstants.XpsServiceName);
        }

        public bool CheckConnected()
        {
            try
            {
                return _xpsServiceApi.CheckConnected();
            }
            catch
            {
                return false;
            }
        }

        public byte[] MergeXpsDocument(Guid documentId)
        {
            try
            {
                return _xpsServiceApi.MergeXpsDocument(documentId);
            }
            catch
            {
                return null;
            }
        }

        public SignResult SignDocument(Guid documentId, int personId)
        {
            try
            {
                return _xpsServiceApi.SignDocument(documentId, personId);
            }
            catch
            {
                return SignResult.NoMatchedSignRequest;
            }
        }

        public SignResult SignDocument(Guid documentId, int[] positions, int personId)
        {
            try
            {
                return _xpsServiceApi.SignDocument(documentId, positions, personId);
            }
            catch
            {
                return SignResult.NoMatchedSignRequest;
            }
        }

        public byte[] GetSignatures(Guid documentId)
        {
            try
            {
                return _xpsServiceApi.GetSignatures(documentId);
            }
            catch
            {
                return null;
            }
        }

        public byte[] GetSignatures(Guid documentId, DateTime snapshotDateTime)
        {
            try
            {
                return _xpsServiceApi.GetSignatures(documentId, snapshotDateTime);
            }
            catch
            {
                return null;
            }
        }
    }
}
