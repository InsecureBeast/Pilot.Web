using System;
using System.Globalization;
using System.IO;
using System.Reflection;

namespace Pilot.Web.Model
{
    public class DirectoryProvider
    {
        private const string VENDOR_FOLDER = "Pilot.Web";

        public static string CurrentDirectory => AppDomain.CurrentDomain.BaseDirectory;

        public static string GetTempDirectory()
        {
            var directory = Path.Combine(CurrentDirectory, "tmp");
            if (!Directory.Exists(directory))
                Directory.CreateDirectory(directory);

            return directory;
        }

        public static string GetStoragePath(Guid fileId, string archiveRootFolder)
        {
            var bytes = fileId.ToByteArray();
            var result = Path.Combine(archiveRootFolder, bytes[14].ToString(CultureInfo.InvariantCulture), bytes[15].ToString(CultureInfo.InvariantCulture), fileId.ToString());
            return result;
        }

        public static string GetTempPath()
        {
            var tempPath = Path.Combine(GetVendorTempDirectory(), "Temp");
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
