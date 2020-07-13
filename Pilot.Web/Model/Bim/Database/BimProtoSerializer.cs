using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using K4os.Compression.LZ4;
using ProtoBuf;

namespace Pilot.Web.Model.Bim.Database
{
    public class BimProtoSerializer
    {
        public static byte[] Serialize<T>(T obj)
        {
            using (var ms = new MemoryStream())
            {
                ProtoBuf.Serializer.Serialize(ms, obj);
                return LZ4Pickler.Pickle(ms.ToArray(), LZ4Level.L12_MAX);
            }
        }

        public static T Deserialize<T>(byte[] data)
        {
            using (var fs = new MemoryStream(LZ4Pickler.Unpickle(data)))
            {
                return ProtoBuf.Serializer.Deserialize<T>(fs);
            }
        }
    }
}
