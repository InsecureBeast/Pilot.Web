using System;
using System.Collections.Generic;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder.SearchTerms
{
    class AnyOfSearchTerm : MarshalByRefObject, ISearchTerm
    {
        private readonly string _fieldName;
        private readonly IEnumerable<string> _values;

        public AnyOfSearchTerm(string fieldName, IEnumerable<string> values)
        {
            _fieldName = fieldName;
            _values = values;
        }

        public string FieldName
        {
            get { return _fieldName; }
        }

        public string ToLuceneString()
        {
            return string.Format(LuceneHelper.TERM_FORMAT, _fieldName, LuceneHelper.JoinOr(_values));
        }
    }
}
