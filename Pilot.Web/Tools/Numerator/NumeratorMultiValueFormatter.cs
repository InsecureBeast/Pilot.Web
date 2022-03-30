using System.Collections.Generic;
using System.Linq;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools.Numerator
{
    public class NumeratorMultiValueFormatter<T> : NumeratorFormatter<T>
    {
        public NumeratorMultiValueFormatter(INumeratorKeywordProvider<T> keywordProvider, Dictionary<string, IArgumentTemplate> templates = null, IContextFactory<T> contextFactory = null) : base(keywordProvider, templates, contextFactory)
        {
        }

        protected override string GetFormattedArguments(T obj, string keyword, string separator, string itemFormat, TemplateFormatter<T> templateFormatter)
        {
            var values = _keywordProvider.GetValues(obj, keyword).ToList();
            return templateFormatter.Format(values, separator, itemFormat);
        }
    }
}
