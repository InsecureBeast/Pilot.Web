using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Pilot.Xps.Entities
{
    public interface IXpsServiceApi
    {
        byte[] MergeXpsDocument(Guid documentId);
    }
}
