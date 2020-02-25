using System.Collections.Generic;
using System.Runtime.InteropServices;

namespace DocumentRender.DocumentConverter
{
    public interface IDocumentConverterFactory
    {
        IDocumentConverter GetDocumentConverter();
    }

    public class DocumentConverterFactory : IDocumentConverterFactory
    {
        private readonly Dictionary<OSPlatform, IDocumentConverter> _converters = new Dictionary<OSPlatform, IDocumentConverter>();

        public DocumentConverterFactory()
        {
            _converters.Add(OSPlatform.Windows, new WindowsDocumentConverter());
            _converters.Add(OSPlatform.Linux, new LinuxDocumentConverter());
        }

        public IDocumentConverter GetDocumentConverter()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                return _converters[OSPlatform.Windows];

            return _converters[OSPlatform.Linux];
        }
    }
}

