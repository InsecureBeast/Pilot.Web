using System.Collections.Generic;
using System.Globalization;
using System.Text.RegularExpressions;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools.Numerator
{
    public class NumeratorFormatter
    {
        private static readonly Regex FormatRegex = new Regex(@"(?<!\{)(?>\{\{)*\{[a-zA-Z_$][a-zA-Z_$0-9]*", RegexOptions.Compiled);
        private readonly INumeratorKeywordProvider _keywordProvider;

        public NumeratorFormatter(INumeratorKeywordProvider keywordProvider)
        {
            _keywordProvider = keywordProvider;
        }

        public string Format(string formatString, Dictionary<string, string> values)
        {
            var obj = new DObject();
            if (values != null)
            {
                foreach (var value in values)
                {
                    obj.Attributes[value.Key] = value.Value;
                }
            }

            return Format(obj, formatString);
        }

        public string Format(INObject obj, string formatString)
        {
            var arguments = new List<object>();
            var replaces = new Dictionary<string, string>();
            var matches = FormatRegex.Matches(formatString);
            foreach (Match match in matches)
            {
                var keyword = match.Value.Trim('{');
                var value = _keywordProvider.GetValue(obj, keyword);
                replaces.Add(match.Value, match.Value.Replace(keyword, arguments.Count.ToString()));
                arguments.Add(value);
            }
            var netFormatString = formatString;
            foreach (var replace in replaces)
            {
                netFormatString = netFormatString.Replace(replace.Key, replace.Value);
            }
            return string.Format(CultureInfo.CurrentUICulture, netFormatString, arguments.ToArray());
        }
    }
}
