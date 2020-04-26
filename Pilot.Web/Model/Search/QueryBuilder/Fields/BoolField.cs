using System;
using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public abstract class BoolField : FieldBase, IField<bool>
    {
        public string FieldName => _fieldName;

        protected internal BoolField(string fieldName) : base(fieldName)
        {
        }

        public abstract ISearchTerm Be(bool value);

        public virtual ISearchTerm Exists()
        {
            return new ExistsTerm(_fieldName);
        }
    }

    internal class BoolAsStringAttributeField : BoolField
    {

        internal BoolAsStringAttributeField(string fieldName) : base(fieldName)
        {
        }

        public override ISearchTerm Be(bool value)
        {
            return new SimpleSearchTerm(_fieldName, value.ToString());
        }
    }

    internal class BoolAsInt32Field : BoolField
    {

        internal BoolAsInt32Field(string fieldName) : base(fieldName)
        {
        }

        public override ISearchTerm Be(bool value)
        {
            return new SimpleSearchTerm(_fieldName, WithPrefix(Convert.ToInt32(value)));
        }

        private string WithPrefix(Int32 value)
        {
            return NumericAwarePrefix.NUMERIC_PREFIX_INT_32 + value;
        }
    }

    internal class BoolAsInt64Field : BoolField
    {

        internal BoolAsInt64Field(string fieldName) : base(fieldName)
        {
        }

        public override ISearchTerm Be(bool value)
        {
            return new SimpleSearchTerm(_fieldName, WithPrefix(Convert.ToInt64(value)));
        }

        private string WithPrefix(Int64 value)
        {
            return NumericAwarePrefix.NUMERIC_PREFIX_INT_64 + value;
        }
    }
}
