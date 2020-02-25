using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Pilot.Web.Model.Search.NextTasksSearchExpression.Tokens;

namespace Pilot.Web.Model.Search.NextTasksSearchExpression
{
    class NextTasksSearchExpressionFactory : ISearchExpressionFactory
    {
        public ISearchExpression Parse(string expressionString, ISearchExpressionContext items)
        {
            return new SearchExpression(new NextTaskWhitespaceToken(), expressionString, items);
        }
    }
}
