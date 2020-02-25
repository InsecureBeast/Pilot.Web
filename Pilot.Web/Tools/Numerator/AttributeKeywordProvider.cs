using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools.Numerator
{
    public class AttributeKeywordProvider : INumeratorKeywordProvider
    {
        public object GetValue(INObject obj, string keyword)
        {
            return obj.Attributes.TryGetValue(keyword, out DValue value) ? value.Value : null;
        }
    }
}
