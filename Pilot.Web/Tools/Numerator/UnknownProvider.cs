using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools.Numerator
{
    public class UnknownProvider : INumeratorKeywordProvider
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
    }
}
