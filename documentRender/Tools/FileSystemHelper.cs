using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;

namespace DocumentRender.Tools
{
    class FileSystemHelper
    {
        public static void DeleteFile(string filename)
        {
            try
            {
                File.Delete(filename);
            }
            catch (Exception)
            {
                ;
            }
        }
        
        public static void DeleteDirectory(string path)
        {
            if (!Directory.Exists(path))
                return;

            foreach (var file in Directory.GetFiles(path))
            {
                try
                {
                    File.Delete(file);
                }
                catch (FileNotFoundException)
                {
                }
            }

            var directories = Directory.GetDirectories(path);
            if (directories.Any())
            {
                foreach (var directory in directories)
                    DeleteDirectory(directory);
            }

            DeleteDirectoryCore(path);
        }

        private static void DeleteDirectoryCore(string path, int timeout = 500)
        {
            Stopwatch sw = Stopwatch.StartNew();
            while (true)
            {
                if (sw.ElapsedMilliseconds > timeout)
                    throw new TimeoutException("DeleteDirectoryCore exceeded timeout " + timeout);

                try
                {
                    Directory.Delete(path, true);
                    return;
                }
                catch (DirectoryNotFoundException)
                {
                    return;
                }
                catch (Exception)
                {
                    Thread.Sleep(5);
                }
            }
        }
    }
}
