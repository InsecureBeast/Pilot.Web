using System.IO;

namespace Pilot.Web.Tools
{
    static class StreamExtensions
    {
        public static byte[] ToByteArray(this Stream stream)
        {
            using (stream)
            {
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    stream.CopyTo((Stream)memoryStream);
                    return memoryStream.ToArray();
                }
            }
        }
    }
}
