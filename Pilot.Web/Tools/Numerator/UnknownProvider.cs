using System.Collections.Generic;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools.Numerator
{
    public class UnknownProvider : INumeratorKeywordProvider<INObject>
    {
        const string DEFAULT_PLACEHOLDER = "***";
        private readonly string _placeholder;

        public UnknownProvider(string placeholder)
        {
            _placeholder = string.IsNullOrEmpty(placeholder) ? DEFAULT_PLACEHOLDER : placeholder;
        }

        public object GetValue(INObject obj, string keyword)
        {
            return _placeholder;
        }

        public IEnumerable<object> GetValues(INObject obj, string keyword)
        {
            return new[] { GetValue(obj, keyword) };
        }
    }
}
