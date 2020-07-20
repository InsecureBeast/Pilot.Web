using System.Collections.Generic;

namespace Pilot.Web.Model.Bim
{
    public static class AttributeHelper
    {
        public static T GetValueOrDefault<T>(this IDictionary<string, object> attributes, string key)
        {
            if (attributes == null)
                return default(T);

            if (!attributes.TryGetValue(key, out var value))
                return default(T);

            if (value is T tValue)
                return tValue;

            return default(T);
        }
    }
}
