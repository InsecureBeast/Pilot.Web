using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Pilot.Xps.Entities;

namespace Pilot.Web.Model.DataObjects
{
    public class DtoCreator
    {
        public static IList<XpsDigitalSignature> CreateDigitalSignatures(byte[] buffer)
        {
            var result = buffer == null
                ? Array.Empty<XpsDigitalSignature>()
                : XpsDigitalSignatureSerializer.Deserialize(buffer);

            return result;
        }
    }
}
