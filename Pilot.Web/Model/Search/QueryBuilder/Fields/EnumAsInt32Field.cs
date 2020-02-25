using System;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    internal class EnumAsInt32Field<T> : EnumField<T>
    {
        public EnumAsInt32Field(string fieldName) : base(fieldName)
        {
        }

        protected internal override string WithPrefix(T value)
        {
            return NumericAwarePrefix.NUMERIC_PREFIX_INT_32 + Convert.ToInt32(value);
        }
    }
}
