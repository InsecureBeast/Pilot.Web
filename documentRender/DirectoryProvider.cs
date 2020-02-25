using System;
using System.IO;
using System.Reflection;

namespace DocumentRender
{
    static class DirectoryProvider
    {
        private const string VENDOR_FOLDER = "ASCON";

        public static string GetCurrentDirectory()
        {
            var executeAssLocation = Assembly.GetExecutingAssembly().Location;
            var directory = Path.GetDirectoryName(executeAssLocation);
            if (string.IsNullOrEmpty(directory))
                throw new InvalidOperationException();

            return directory;
        }

        public static string GetCurrentTempDirectory()
        {
            var currentDirectory = GetCurrentDirectory();
            var directory = Path.Combine(currentDirectory, "tmp");
            if (!Directory.Exists(directory))
                Directory.CreateDirectory(directory);

            return directory;
        }

        public static string GetTempDirectory()
        {
            var tempPath = Path.Combine(GetVendorTempDirectory(), "WebDocumentRender");
            if (!Directory.Exists(tempPath))
                Directory.CreateDirectory(tempPath);
            return tempPath;
        }

        public static string GetVendorTempDirectory()
        {
            var tempPath = Path.Combine(Path.GetTempPath(), VENDOR_FOLDER);
            if (!Directory.Exists(tempPath))
                Directory.CreateDirectory(tempPath);
            return tempPath;
        }
    }
}
