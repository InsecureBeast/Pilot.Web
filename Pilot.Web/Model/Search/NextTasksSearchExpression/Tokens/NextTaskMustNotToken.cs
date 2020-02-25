using System;
using System.Collections.Generic;
using Ascon.Pilot.Common;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search.NextTasksSearchExpression.Tokens
{
    class NextTaskMustNotToken : KeywordToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NextTaskSearchPhraseToken),
            typeof(NextTaskStartQuotedSearchPhraseToken),
            typeof(NextTaskMySearchToken),     
            typeof(NextTaskTypeToken),
            typeof(NextTaskAttributeToken),
        };

        public override string Alias => SearchTokenAliases.MustNotAlias;
        public override string Hint => "Exclude from search results";
        public override string SerializationAlias => Alias;

        protected override void UpdateTokenContext(TokenContext context)
        {
            context[WhitespaceToken.TERM_OCCUR] = new ContextItem(TermOccur.MustNot, typeof(NextTaskWhitespaceToken));
            base.UpdateTokenContext(context);
        }
    }
}
