using System;
using System.Collections.Generic;
using System.Linq;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder.SearchTerms
{
    class GroupingSearchTerm : MarshalByRefObject, ISearchTerm
    {
        private readonly string _fieldName;
        private readonly IEnumerable<string> _values;

        public GroupingSearchTerm(string fieldName, IEnumerable<string> values)
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
            if(!_values.Any())
                throw new ArgumentException("GroupingSearchTerm values collection can not be empty");

            var value = string.Join(" ", _values.Select(x => string.Format("{0}{1}", LuceneHelper.MUST_OPERATOR, x)));
            return string.Format(LuceneHelper.TERM_FORMAT,_fieldName, string.Format(LuceneHelper.SUBQUERY_FORMAT, value));
        }
    }
}