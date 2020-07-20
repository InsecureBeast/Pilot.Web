using System.IO;
using K4os.Compression.LZ4;
using ProtoBuf;

namespace Pilot.Web.Model.Bim.Serialization
{

    public class BimProtoSerializer
    { 
        public static byte[] Serialize<T>(T obj)
        {
            using (var ms = new MemoryStream())
            {
                Serializer.Serialize(ms, obj);
                return LZ4Pickler.Pickle(ms.ToArray(), LZ4Level.L12_MAX);
            }
        }

        public static T Deserialize<T>(byte[] data)
        {
            using (var fs = new MemoryStream(LZ4Pickler.Unpickle(data)))
            {
                return Serializer.Deserialize<T>(fs);
            }
        }
    }
}
    