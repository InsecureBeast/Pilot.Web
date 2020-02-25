using System.Linq;
using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public abstract class EnumField<T> : FieldBase, IField<T>, IAnyOfField<T>
    {
        internal EnumField(string fieldName) : base(fieldName)
        {
        }

        public string FieldName => _fieldName;

        public ISearchTerm Be(T value)
        {
            return new SimpleSearchTerm(_fieldName, WithPrefix(value));
        }

        public ISearchTerm Exists()
        {
            return new ExistsTerm(_fieldName);
        }

        public ISearchTerm BeAnyOf(params T[] values)
        {
            return new AnyOfSearchTerm(_fieldName, values.Select(x => WithPrefix(x)));
        }

        protected internal abstract string WithPrefix(T value);
    }
}
