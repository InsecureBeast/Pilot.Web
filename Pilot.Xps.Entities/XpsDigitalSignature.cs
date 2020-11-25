using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;

namespace Pilot.Xps.Entities
{
    [Serializable]
    public class XpsDigitalSignature
    {
        public Guid Id { get; set; }
        public string Signer { get; set; }
        public DateTime SignDate { get; set; }
        public bool IsCertificateValid { get; set; }
        public bool IsSigned { get; set; }
        public bool IsValid { get; set; }
    }

    public static class XpsDigitalSignatureSerializer
    {
        private class DigitalSignatureBinder : SerializationBinder
        {
            public override Type BindToType(string assemblyName, string typeName)
            {
                return typeof(XpsDigitalSignature[]);
            }
        }

        public static byte[] Serialize(IList<XpsDigitalSignature> ds)
        {
            var ms = new MemoryStream();
            new BinaryFormatter().Serialize(ms, ds);
            ms.Position = 0;
            return ms.ToArray();
        }

        public static IList<XpsDigitalSignature> Deserialize(byte[] buffer)
        {
            using (var stream = new MemoryStream(buffer))
            {
                return Deserialize(stream);
            }
        }

        public static IList<XpsDigitalSignature> Deserialize(Stream stream)
        {
            stream.Position = 0;
            var res = new BinaryFormatter().Deserialize(stream);
            return res as IList<XpsDigitalSignature>;
        }
    }
}
