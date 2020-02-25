using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace DocumentRender
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
