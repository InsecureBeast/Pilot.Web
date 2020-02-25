using System;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder.SearchTerms
{
    class RangeSearchTerm : MarshalByRefObject, ISearchTerm
    {
        private readonly string _fieldName;
        private readonly string _from;
        private readonly string _to;

        public RangeSearchTerm(string fieldName, string from, string to)
        {
            _fieldName = fieldName;
            _from = from;
            _to = to;
        }

        public string FieldName
        {
            get { return _fieldName; }
        }

        string ISearchTerm.ToLuceneString()
        {
            return string.Format(LuceneHelper.TERM_FORMAT, _fieldName, string.Format(LuceneHelper.RANGE_FORMAT, _from, _to));
        }
    }
}