using System.Collections.Generic;

namespace DocumentRender
{
    public interface IDocumentRender
    {
        byte[] RenderPage(byte[] content, int page, double scale);
        IEnumerable<byte[]> RenderPages(byte[] content, double scale);
    }
}
