using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace DocumentRender.Tools
{
    static class ByteArrayExtensions
    {
        public static string ToFile(this byte[] content, string filename)
        {
            using (var fileStream = File.Create(filename))
                fileStream.Write(content, 0, content.Length);

            return filename;
        }
    }
}
