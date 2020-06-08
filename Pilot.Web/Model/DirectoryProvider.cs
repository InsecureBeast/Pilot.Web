using System;
using System.Globalization;
using System.IO;

namespace Pilot.Web.Model
{
    public class DirectoryProvider
    {
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
            var dir = Path.Combine(archiveRootFolder, bytes[14].ToString(CultureInfo.InvariantCulture), bytes[15].ToString(CultureInfo.InvariantCulture));
            if (!Directory.Exists(dir))
                Directory.CreateDirectory(dir);

            var result = Path.Combine(dir, fileId.ToString());
            return result;
        }
    }
}
