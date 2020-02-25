using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search
{
    interface ISearchExpressionContext
    {
        IEnumerable<IPresetItem> GetPresetItems(IToken target);
        IList<IToken> ValidateNextTokens(ISearchExpression expression, IToken token, IList<IToken> nextTokens);
        bool IsInvariantCulture { get; }
    }

    interface ISearchExpression
    {
        //bool IsValid { get; }
        //bool IsEmpty { get; }
        //bool IsIncomplete { get; }
        //IToken LastToken { get; }
        //ReadOnlyCollection<IToken> GetValidNexts(int? tokenIndex = null);
        ReadOnlyCollection<IToken> Tokens { get; }
    }
}
