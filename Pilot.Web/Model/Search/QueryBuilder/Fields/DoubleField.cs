using System.Linq;
using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public class DoubleField : FieldBase, IField<double>, IAnyOfField<double>, IRangeField<double>
    {
        internal DoubleField(string fieldName) : base (fieldName)
        {
        }

        public string FieldName => _fieldName;

        public ISearchTerm Be(double value)
        {
            return new SimpleSearchTerm(_fieldName, WithPrefix(value));
        }

        public ISearchTerm Exists()
        {
            return new ExistsTerm(_fieldName);
        }

        public ISearchTerm BeAnyOf(params double[] values)
        {
            return new AnyOfSearchTerm(_fieldName, values.Select(x => WithPrefix(x)));
        }

        public ISearchTerm BeInRange(double from, double to)
        {
            return new RangeSearchTerm(_fieldName, WithPrefix(from), WithPrefix(to));
        }

        private string WithPrefix(double value)
        {
            return NumericAwarePrefix.NUMERIC_PREFIX_DOUBLE + value;
        }
    }
}