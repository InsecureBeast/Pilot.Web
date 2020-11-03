using System;
using System.Collections.Generic;
using System.IO;

namespace DocumentRender.DocumentConverter
{
    public interface IDrawToolProvider
    {
        ToolProperties GetDrawTool();
    }

    class DrawToolProvider : IDrawToolProvider
    {
        private readonly List<ToolProperties> _tools = new List<ToolProperties>();
        private readonly ToolProperties _defaultTool;

        public DrawToolProvider()
        {
            // 0 - drawResultPath
            // 1 - filename
            // 2 - page
            // 3 - dpi -r 72 default
            _tools.Add(new ToolProperties("/usr/bin/mutool", "draw -r {3} -o {0} {1} {2}"));
            _tools.Add(new ToolProperties("/usr/bin/mudraw", "-r {3} -o {0} {1} {2}"));

            foreach (var tool in _tools)
            {
                if (!File.Exists(tool.ToolName))
                    continue;

                _defaultTool = tool;
                //logger.Info("Draw tool set to " + _defaultTool.ToolName);
            }
        }

        public ToolProperties GetDrawTool()
        {
            if (_defaultTool == null)
                throw new RenderToolNotFoundException();

            return _defaultTool;
        }
    }

    public class ToolProperties
    {
        private readonly string _argumentsFormat;

        public static string GetPageFormat(int page)
        {
            return $"page{page:0000}.png";
        }

        public ToolProperties(string toolName, string argumentsFormat)
        {
            _argumentsFormat = argumentsFormat;
            ToolName = toolName;
        }

        public string ToolName { get; }

        public string GetArguments(string filename, string outputDir, int? page, double scale)
        {
            var pageName = "page%04d.png";
            if (page != null)
                pageName = GetPageFormat((int)page);

            var drawResultPath = Path.Combine(outputDir, pageName);

            var arguments = string.Format(_argumentsFormat, drawResultPath, filename, page, GetResolution(scale));
            return arguments;
        }

        private int GetResolution(double scale)
        {
            return (int) (120 * scale);
        }
    }
}
