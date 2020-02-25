using System.Collections.Generic;

namespace DocumentRender.DocumentConverter
{
    public interface IDocumentConverter
    {
        byte[] ConvertPage(byte[] content, int page, double scale);
        IEnumerable<byte[]> ConvertFile(byte[] content, double scale);
    }
}
