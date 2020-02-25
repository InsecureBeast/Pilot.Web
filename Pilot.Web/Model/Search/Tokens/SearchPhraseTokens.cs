using System;
using System.Collections.Generic;
using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Search.Tokens
{
    #region keyword tokens
    class SearchPhraseToken : ArgumentToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(WhitespaceToken),
        };

        public override IArgumentToken Parse(string expressionString, ISearchExpressionContext items)
        {
            var argumentToken = (SearchPhraseToken)base.Parse(expressionString, items);
            return argumentToken; 
        }
    }

    class StartQuotedSearchPhraseToken : KeywordToken
    {
        public override bool IsTerminal => false;

        public override string Alias => SearchTokenAliases.DoubleQuotesAlias;

        public override string Hint { get; } = "start a search phrase";

        public override string SerializationAlias => Alias;

        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(QuotedSearchPhraseToken)
        };
    }

    class QuotedSearchPhraseToken : ArgumentToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(EndQuotedSearchPhraseToken),
        };
    }

    class EndQuotedSearchPhraseToken : KeywordToken
    {
        public override string Alias => SearchTokenAliases.DoubleQuotesAlias;

        public override string SerializationAlias => Alias;

        public override string Hint => "end a search phrase";

        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(WhitespaceToken)
        };
    }
    #endregion
}
