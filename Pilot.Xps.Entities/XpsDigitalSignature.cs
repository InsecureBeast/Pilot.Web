using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using Newtonsoft.Json;

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
        public string Role { get; set; }
        public bool CanUserSign { get; set; }
        public bool IsAdditional { get; set; }
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
            try
            {
                return DeserializeJson(buffer);
            }
            catch (Exception)
            {
                return DeserializeBinary(buffer);
            }
        }

        private static byte[] SerializeJson(IList<XpsDigitalSignature> ds)
        {
            var jsonString = JsonConvert.SerializeObject(ds);
            var bytes = Encoding.UTF8.GetBytes(jsonString);
            return bytes;
        }

        private static IList<XpsDigitalSignature> DeserializeJson(byte[] buffer)
        {
            var bytesAsString = Encoding.UTF8.GetString(buffer);
            var ds = JsonConvert.DeserializeObject<IList<XpsDigitalSignature>>(bytesAsString);
            return ds;
        }

        private static IList<XpsDigitalSignature> DeserializeBinary(byte[] buffer)
        {
            using (var stream = new MemoryStream(buffer))
            {
                stream.Position = 0;
                var res = new BinaryFormatter().Deserialize(stream);
                return res as IList<XpsDigitalSignature>;
            }
        }
    }
}
