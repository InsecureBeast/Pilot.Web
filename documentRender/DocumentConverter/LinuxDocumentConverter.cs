using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using DocumentRender.Tools;
using log4net;

namespace DocumentRender.DocumentConverter
{
    internal class LinuxDocumentConverter : IDocumentConverter
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(LinuxDocumentConverter));
        private readonly DrawToolProvider _toolProvider;
        private readonly ToolRunner _toolRunner;

        public LinuxDocumentConverter()
        {
            _toolProvider = new DrawToolProvider(_logger);
            _toolRunner = new ToolRunner();
        }

        public byte[] ConvertPage(byte[] content, int page, double scale)
        {
            var filename = SaveFile(content);
            var tool = _toolProvider.GetDrawTool();
            var outputDir = GetImagesOutputDir(filename);
            _toolRunner.Run(tool, filename, outputDir, page, scale);

            var file = Directory.GetFiles(outputDir).FirstOrDefault();
            var result = file != null ? FileToBytes(file) : null;
            FileSystemHelper.DeleteDirectory(outputDir);
            return result;
        }

        public IEnumerable<byte[]> ConvertFile(byte[] content, double scale)
        {
            var filename = SaveFile(content);
            var tool = _toolProvider.GetDrawTool();
            var outputDir = GetImagesOutputDir(filename);
            _toolRunner.Run(tool, filename, outputDir, scale);

            var result = new List<byte[]>();
            foreach (var file in Directory.EnumerateFiles(outputDir))
            {
                var bytes = FileToBytes(file);
                result.Add(bytes);
            }

            FileSystemHelper.DeleteDirectory(outputDir);
            return result;
        }

        private string SaveFile(byte[] content)
        {
            var tempDirectory = DirectoryProvider.GetCurrentTempDirectory();
            var xpsFilename = Path.Combine(tempDirectory, Guid.NewGuid() + ".xps");
            using (var fileStream = File.Create(xpsFilename))
                fileStream.Write(content, 0, content.Length);

            return xpsFilename;
        }

        private static byte[] FileToBytes(string fileName)
        {
            using (var stream = File.OpenRead(fileName))
            using (var ms = new MemoryStream())
            {
                stream.CopyTo(ms);
                return ms.ToArray();
            }
        }

        private string GetImagesOutputDir(string fileName)
        {
            var fileDir = Path.GetDirectoryName(fileName);
            var resultDir = Path.Combine(fileDir, "pages");
            if (!Directory.Exists(resultDir))
                Directory.CreateDirectory(resultDir);

            return resultDir;
        }

        private int GetPagesCount(string dir)
        {
            return Directory.EnumerateFiles(dir).Count();
        }
    }
}
