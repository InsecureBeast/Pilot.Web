using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace DocumentRender.DocumentConverter
{
    internal class WindowsDocumentConverter : IDocumentConverter
    {
        public byte[] ConvertPage(byte[] content, int page, double scale)
        {
            using (var stream = new MemoryStream(content))
            {
                return RenderFirstPageInBytes(stream, page, scale);
            }
        }

        public IEnumerable<byte[]> ConvertFile(byte[] content, double scale)
        {
            using (var stream = new MemoryStream(content))
            {
                return LoadPages(stream, scale);
            }
        }

        private byte[] RenderFirstPageInBytes(Stream xpsStream, int page, double scale)
        {
            using (var tileManager = new TilesManager(xpsStream))
            {
                return LoadPage(tileManager, page, scale);
            }
        }

        private static byte[] LoadPage(TilesManager tileManager, int page, double scale)
        {
            var internalPage = page;
            if (page > 0)
                internalPage = page - 1;

            int pageWidth = 0, pageHeight = 0;
            tileManager.LoadPage(internalPage, ref pageWidth, ref pageHeight, false);
            var tile = new Tile
            {
                PageNum = internalPage,
                Height = (int) (pageHeight * scale),
                Width = (int) (pageWidth * scale),
                Scale = scale
            };
            var result = tileManager.GetPageInBytes(tile, false);
            return result;
        }

        private IEnumerable<byte[]> LoadPages(Stream xpsStream, double scale)
        {
            var result = new List<byte[]>();
            using (var tileManager = new TilesManager(xpsStream))
            {
                for (var i = 0; i < tileManager.PageCount; i++)
                {
                    int pageWidth = 0, pageHeight = 0;
                    tileManager.LoadPage(i, ref pageWidth, ref pageHeight, false);
                    var tile = new Tile
                    {
                        PageNum = i,
                        Height = (int) (pageHeight * scale),
                        Width = (int) (pageWidth * scale),
                        Scale = scale
                    };

                    var page = tileManager.GetPageInBytes(tile, false);
                    result.Add(page);
                }
            }
            return result;
        }
    }
}
