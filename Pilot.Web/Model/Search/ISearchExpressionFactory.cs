using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pilot.Web.Model.Search
{
    interface ISearchExpressionFactory
    {
        ISearchExpression Parse(string expressionString, ISearchExpressionContext items);
    }
}
