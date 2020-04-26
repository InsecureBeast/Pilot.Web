using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    class EmptySearchTerm : ISearchTerm
    {
        public static readonly EmptySearchTerm Instanse = new EmptySearchTerm();

        private EmptySearchTerm()
        {
        }

        public string FieldName => null;

        public string ToLuceneString()
        {
            return null;
        }
    }

    class EmptyBoolField : BoolField
    {
        internal EmptyBoolField(string fieldName) : base(fieldName)
        {
        }

        public override ISearchTerm Be(bool value)
        {
            return EmptySearchTerm.Instanse;
        }

        public override ISearchTerm Exists()
        {
            return EmptySearchTerm.Instanse;
        }

        
    }
}
