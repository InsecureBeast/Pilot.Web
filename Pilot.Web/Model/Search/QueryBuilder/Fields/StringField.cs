using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public class StringField : FieldBase, IField<string>, IContainsAllField<string>
    {
        protected internal StringField(string fieldName) : base(fieldName)
        {
        }

        public string FieldName => _fieldName;

        public ISearchTerm Be(string value)
        {
            return new SimpleSearchTerm(_fieldName, value);
        }

        public ISearchTerm Exists()
        {
            return new ExistsTerm(_fieldName);
        }

        public ISearchTerm ContainsAll(params string[] values)
        {
            return new GroupingSearchTerm(_fieldName, values);
        }
    }
}
