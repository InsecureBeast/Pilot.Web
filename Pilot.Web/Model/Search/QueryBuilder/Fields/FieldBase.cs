using System;
using System.Text.RegularExpressions;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public abstract class FieldBase : MarshalByRefObject
    {
        protected readonly string _fieldName;

        internal FieldBase(string fieldName)
        {
            _fieldName = EscapeFieldName(fieldName);
        }

        private static string EscapeFieldName(string fieldName)
        {
            return string.IsNullOrEmpty(fieldName)
                ? fieldName
                : Regex.Escape(fieldName);
        }
    }
}
