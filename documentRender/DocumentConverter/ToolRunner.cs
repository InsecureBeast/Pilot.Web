using System.Diagnostics;

namespace DocumentRender.DocumentConverter
{
    class ToolRunner
    {
        public void Run(ToolProperties tool, string filename, string outputDir, double scale)
        {
            RunTool(tool, filename, outputDir, null, scale);
        }

        public void Run(ToolProperties tool, string filename, string outputDir, int page, double scale)
        {
            RunTool(tool, filename, outputDir, page, scale);
        }

        private static void RunTool(ToolProperties tool, string filename, string outputDir, int? page, double scale)
        {
            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = tool.ToolName,
                    Arguments = tool.GetArguments(filename, outputDir, page, scale),
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                }
            };
            process.Start();
            process.StandardOutput.ReadToEnd();
            process.WaitForExit();
        }
    }
}