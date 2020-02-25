using System;
using System.Linq;
using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public class Int64Field : FieldBase, IField<Int64>, IRangeField<Int64>, IAnyOfField<Int64>
    {
        internal Int64Field(string fieldName) : base(fieldName)
        {
        }

        public string FieldName => _fieldName;

        public ISearchTerm Be(Int64 value)
        {
            return new SimpleSearchTerm(_fieldName, WithPrefix(value));
        }

        public ISearchTerm Exists()
        {
            return new ExistsTerm(_fieldName);
        }

        public ISearchTerm BeInRange(Int64 from, Int64 to)
        {
            return new RangeSearchTerm(_fieldName, WithPrefix(from), WithPrefix(to));
        }

        public ISearchTerm BeAnyOf(params Int64[] values)
        {
            return new AnyOfSearchTerm(_fieldName, values.Select(x => WithPrefix(x)));
        }

        private string WithPrefix(Int64 value)
        {
            return NumericAwarePrefix.NUMERIC_PREFIX_INT_64 + value;
        }
    }
}
