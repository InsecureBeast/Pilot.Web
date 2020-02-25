using System;
using System.Collections.Generic;
using System.Linq;
using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Search.Tokens
{
    class SearchContextToken : KeywordToken
    {
        public override string Alias => "Context:";
        public override string Hint => "specify search context";
        public override string SerializationAlias => SearchTokenAliases.ContextSearchAlias;

        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(SearchContextArgumentToken),
        };

        public override bool IsValidAsNext(IList<IToken> expressionTokens)
        {
            return !expressionTokens.Any(x => x is SearchContextToken);
        }
    }

    class SearchContextArgumentToken : ArgumentToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(WhitespaceToken)
        };

        public override bool AllowCustomValues => false;

        public override bool SuggestIgnoringText => true;
    }
}
