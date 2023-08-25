using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools.Numerator
{
    public class TemplateFormatter<T>
    {
        private readonly INumeratorKeywordProvider<T> _keywordProvider;
        private readonly Dictionary<string, IArgumentTemplate> _templates;
        private readonly IContextFactory<T> _contextFactory;

        public TemplateFormatter(INumeratorKeywordProvider<T> keywordProvider, Dictionary<string, IArgumentTemplate> templates, IContextFactory<T> contextFactory)
        {
            _keywordProvider = keywordProvider;
            _templates = templates;
            _contextFactory = contextFactory;
        }

        public string Format(List<object> arguments, string separator, string itemFormat)
        {
            var formattedValues = new StringBuilder();

            var i = 0;
            foreach (var argument in arguments)
            {
                if (argument is DObject obj)
                {
                    var formatter = new NumeratorMultiValueFormatter<T>(_keywordProvider, _templates, _contextFactory);
                    var formatted = formatter.Format(_contextFactory.GetContext(obj), itemFormat);
                    formattedValues.Append(formatted);
                }
                else
                {
                    if (string.IsNullOrEmpty(itemFormat))
                        formattedValues.Append(argument);
                    else
                    {
                        formattedValues.Append(string.Format("{" + $"0:{itemFormat}" + "}", argument));
                    }

                }
                if (i < arguments.Count - 1)
                {
                    formattedValues.Append(separator);
                    i++;
                }
            }

            return formattedValues.ToString();
        }
    }
}
