using Pilot.Web.Model.Search.QueryBuilder.Fields;

namespace Pilot.Web.Model.Search.QueryBuilder
{
    public static class AttributeFields
    {
        public static StringField String(string attributeName)
        {
            return new StringField(AttributeFieldTypePrefixes.Add(AttributeFieldTypePrefixes.TEXT, attributeName));
        }

        public static DateTimeField DateTime(string attributeName)
        {
            return new DateTimeField(AttributeFieldTypePrefixes.Add(AttributeFieldTypePrefixes.STRING, attributeName));
        }

        public static DoubleField Double(string attributeName)
        {
            return new DoubleField(AttributeFieldTypePrefixes.Add(AttributeFieldTypePrefixes.DOUBLE, attributeName));
        }

        public static Int64Field Integer(string attributeName)
        {
            return new Int64Field(AttributeFieldTypePrefixes.Add(AttributeFieldTypePrefixes.INT64, attributeName));
        }

        public static Int32Field OrgUnit(string attributeName)
        {
            return new Int32Field(AttributeFieldTypePrefixes.Add(AttributeFieldTypePrefixes.INT32, attributeName));
        }

        public static GuidField State(string attributeName)
        {
            return new GuidField(AttributeFieldTypePrefixes.Add(AttributeFieldTypePrefixes.STRING, attributeName));
        }
    }
}