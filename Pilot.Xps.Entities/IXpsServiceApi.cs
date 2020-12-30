using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Pilot.Xps.Entities
{
    public interface IXpsServiceApi
    {
        bool CheckConnected();
        byte[] MergeXpsDocument(Guid documentId);
        SignResult SignDocument(Guid documentId, int personId);
        SignResult SignDocument(Guid documentId, int[] positions, int personId);
        byte[] GetSignatures(Guid documentId);
        byte[] GetSignatures(Guid documentId, DateTime snapshotDateTime);
    }
}
