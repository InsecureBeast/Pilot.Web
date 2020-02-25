using System;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder.SearchTerms
{
    class ExistsTerm : MarshalByRefObject, ISearchTerm
    {
        private readonly string _fieldName;

        public ExistsTerm(string fieldName)
        {
            _fieldName = fieldName;
        }

        public string FieldName => _fieldName;

        public string ToLuceneString()
        {
            return string.Format(LuceneHelper.TERM_FORMAT, _fieldName, "[* TO *]");
        }
    }
}
