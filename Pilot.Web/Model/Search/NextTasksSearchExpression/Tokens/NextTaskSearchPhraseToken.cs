using System;
using System.Collections.Generic;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search.NextTasksSearchExpression.Tokens
{
    class NextTaskSearchPhraseToken : SearchPhraseToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(NextTaskWhitespaceToken),
        };
    }

    class NextTaskStartQuotedSearchPhraseToken : StartQuotedSearchPhraseToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NextTaskQuotedSearchPhraseToken)
        };
    }

    class NextTaskQuotedSearchPhraseToken : QuotedSearchPhraseToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NextTaskEndQuotedSearchPhraseToken),
        };
    }

    class NextTaskEndQuotedSearchPhraseToken : EndQuotedSearchPhraseToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NextTaskWhitespaceToken)
        };
    }
}
