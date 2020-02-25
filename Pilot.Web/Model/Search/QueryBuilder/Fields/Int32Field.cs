using System;
using System.Linq;
using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public class Int32Field : FieldBase, IField<int>, IRangeField<int>, IAnyOfField<int>
    {
        internal Int32Field(string fieldName) : base(fieldName)
        {
        }

        public string FieldName => _fieldName;
        public ISearchTerm Be(Int32 value)
        {
            return new SimpleSearchTerm(_fieldName, WithPrefix(value));
        }

        public ISearchTerm Exists()
        {
            return new ExistsTerm(_fieldName);
        }

        public ISearchTerm BeInRange(Int32 from, Int32 to)
        {
            return new RangeSearchTerm(_fieldName, WithPrefix(from), WithPrefix(to));
        }

        public ISearchTerm BeAnyOf(params Int32[] values)
        {
            return new AnyOfSearchTerm(_fieldName, values.Select(WithPrefix));
        }

        protected internal virtual string WithPrefix(Int32 value)
        {
            return NumericAwarePrefix.NUMERIC_PREFIX_INT_32 + value;
        }
    }

    internal class Int32To64Field : Int32Field
    {
        public Int32To64Field(string fieldName) : base(fieldName)
        {
        }

        protected internal override string WithPrefix(int value)
        {
            return NumericAwarePrefix.NUMERIC_PREFIX_INT_64 + value;
        }
    }
}
