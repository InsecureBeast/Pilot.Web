using System.Collections.Generic;
using System.Linq;

namespace Pilot.Web.Tools.Numerator
{
    public class NumeratorKeywordProviderAggregator<T> : INumeratorKeywordProvider<T>
    {
        private readonly IEnumerable<INumeratorKeywordProvider<T>> _providers;

        public NumeratorKeywordProviderAggregator(IEnumerable<INumeratorKeywordProvider<T>> providers)
        {
            _providers = providers;
        }

        public object GetValue(T obj, string keyword)
        {
            return _providers.Select(x => x.GetValue(obj, keyword)).FirstOrDefault(x => x != null);
        }

        public IEnumerable<object> GetValues(T obj, string keyword)
        {
            return _providers.Select(x => x.GetValue(obj, keyword));
        }
    }
}
