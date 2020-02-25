using System.Collections.Generic;
using System.Linq;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools.Numerator
{
    public class NumeratorKeywordProviderAggregator : INumeratorKeywordProvider
    {
        private readonly IEnumerable<INumeratorKeywordProvider> _providers;

        public NumeratorKeywordProviderAggregator(IEnumerable<INumeratorKeywordProvider> providers)
        {
            _providers = providers;
        }

        public object GetValue(INObject obj, string keyword)
        {
            return _providers.Select(x => x.GetValue(obj, keyword)).FirstOrDefault(x => x != null);
        }
    }
}
