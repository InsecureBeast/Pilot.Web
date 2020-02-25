using System;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder.SearchTerms
{
    class SimpleSearchTerm : MarshalByRefObject, ISearchTerm
    {
        private readonly string _fieldName;
        private readonly string _value;

        public SimpleSearchTerm(string fieldName, string value)
        {
            _fieldName = fieldName;
            _value = value;
        }

        public string FieldName
        {
            get { return _fieldName; }
        }

        string ISearchTerm.ToLuceneString()
        {
            var luceneString = string.Format(LuceneHelper.TERM_FORMAT, _fieldName, _value);
            return luceneString;
        }
    }
}