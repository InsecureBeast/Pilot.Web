using Pilot.Web.Model.Search.QueryBuilder.Fields;

namespace Pilot.Web.Model.Search.QueryBuilder
{
    public static class AttributeFields
    {
        public static StringField String(string attributeName)
        {
            return new StringField(attributeName);
        }

        public static DateTimeField DateTime(string attributeName)
        {
            return new DateTimeField(attributeName);
        }

        public static DoubleField Double(string attributeName)
        {
            return new DoubleField(attributeName);
        }

        public static Int64Field Integer(string attributeName)
        {
            return new Int64Field(attributeName);
        }

        public static Int32Field OrgUnit(string attributeName)
        {
            return new Int32Field(attributeName);
        }

        public static GuidField State(string attributeName)
        {
            return new GuidField(attributeName);
        }
    }
}