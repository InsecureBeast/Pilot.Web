using System;
using System.Collections.Generic;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search.NextTasksSearchExpression.Tokens
{
    class NextTaskWhitespaceToken : WhitespaceToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(NextTaskWhitespaceToken),
            typeof(NextTaskMustNotToken),
            typeof(NextTaskSearchPhraseToken),
            typeof(NextTaskStartQuotedSearchPhraseToken),
            typeof(NextTaskMySearchToken),
            typeof(NextTaskTypeToken),
            typeof(NextTaskAttributeToken),
        };
    }
}
