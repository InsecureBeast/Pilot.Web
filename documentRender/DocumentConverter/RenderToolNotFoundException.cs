using System;
using System.Collections.Generic;
using System.Text;

namespace DocumentRender.DocumentConverter
{
    public class RenderToolNotFoundException : Exception
    {
        public RenderToolNotFoundException() : base("MuPdf draw tool not found. Please install mupdf-tools on your system")
        {
        }
    }
}
