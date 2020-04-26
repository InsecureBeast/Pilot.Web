namespace Pilot.Web.Model.Search.QueryBuilder
{
    public static class AttributeFieldTypePrefixes
    {
        public const string TEXT = "t";
        public const string STRING = "s";
        public const string INT32 = "i32";
        public const string INT64 = "i64";
        public const string DOUBLE = "d";

        public static string Add(string prefix, string value)
        {
            return $"{prefix}.{value}";
        }
    }
}