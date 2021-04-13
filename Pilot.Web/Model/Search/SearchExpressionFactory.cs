using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search
{
    class SearchExpressionFactory : ISearchExpressionFactory
    {
        public ISearchExpression Parse(string expressionString, ISearchExpressionContext items)
        {
            return new SearchExpression(new WhitespaceToken(), expressionString, items);
        }
    }
}
