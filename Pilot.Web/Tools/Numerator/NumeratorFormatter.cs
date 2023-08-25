using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text.RegularExpressions;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools.Numerator
{
    public class NumeratorFormatter<T>
    {
        private static readonly Regex FormatRegex = new Regex(@"(?<!\{)(?>\{\{)*\{[a-zA-Z_$][a-zA-Z_$0-9]*", RegexOptions.Compiled);
        protected readonly INumeratorKeywordProvider<T> _keywordProvider;
        protected readonly IContextFactory<T> _contextFactory;
        protected readonly Dictionary<string, IArgumentTemplate> _templates;

        public NumeratorFormatter(INumeratorKeywordProvider<T> keywordProvider, Dictionary<string, IArgumentTemplate> templates = null, IContextFactory<T> contextFactory = null)
        {
            _keywordProvider = keywordProvider;
            _contextFactory = contextFactory;
            _templates = templates;
        }

        public string Format(T obj, string formatString, bool ignoreEmpty = false)
        {
            var arguments = new List<object>();
            var matches = FormatRegex.Matches(formatString);
            var netFormatString = formatString;
            foreach (Match match in matches)
            {
                var index = 0;
                do
                {
                    var keyword = match.Value.Trim('{');
                    index = netFormatString.IndexOf(keyword, StringComparison.Ordinal);
                    if (index != -1)
                    {
                        var templateName = GetTemplate(index, keyword, netFormatString);
                        var replace = keyword;
                        if (!string.IsNullOrEmpty(templateName))
                            replace += ":" + templateName;
                        else
                            templateName = "";

                        netFormatString = netFormatString.Replace(replace, arguments.Count.ToString());

                        var separator = "";
                        var itemFormat = "";

                        if (_templates != null && _templates.TryGetValue(templateName.TrimStart('$'), out var template))
                        {
                            separator = template.Separator;
                            itemFormat = template.ItemFormat;
                        }
                        else
                        {
                            itemFormat = templateName;
                        }

                        var templateFormatter = new TemplateFormatter<T>(_keywordProvider, _templates, _contextFactory);
                        var formattedArguments = GetFormattedArguments(obj, keyword, separator, itemFormat, templateFormatter);

                        if (!string.IsNullOrEmpty(formattedArguments) || ignoreEmpty)
                            arguments.Add(formattedArguments);
                        else
                            arguments.Add('{' + replace + '}');
                    }

                } while (index != -1);
            }


            return string.Format(CultureInfo.CurrentUICulture, netFormatString, arguments.ToArray());
        }

        private static string GetTemplate(int index, string keyword, string netFormatString)
        {
            var templateStartIndex = index + keyword.Length;
            var templateEndIndex = netFormatString.IndexOf('}', templateStartIndex);
            templateStartIndex++;

            var templateName = "";
            if (netFormatString[templateStartIndex - 1] == ':')
            {
                templateName = netFormatString.Substring(templateStartIndex, templateEndIndex - templateStartIndex);
            }

            return templateName;
        }

        protected virtual string GetFormattedArguments(T obj, string keyword, string separator, string itemFormat, TemplateFormatter<T> templateFormatter)
        {
            var value = _keywordProvider.GetValue(obj, keyword);
            return templateFormatter.Format(new List<object> { value }, separator, itemFormat);
        }
    }
}
