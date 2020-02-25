using Pilot.Web.Model.Search.QueryBuilder.Fields;

namespace Pilot.Web.Model.Search.QueryBuilder
{
    class FileFields
    {
        public static StringField FileContent => new StringField(FileFieldNames.CONTENT);

        public static DateTimeField CreatedDate => new DateTimeField(FileFieldNames.CREATED);
    }
}
