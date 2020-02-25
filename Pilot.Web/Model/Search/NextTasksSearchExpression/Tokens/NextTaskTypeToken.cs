using System;
using System.Collections.Generic;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search.NextTasksSearchExpression.Tokens
{
    class NextTaskTypeToken : TypeToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NextTaskTypeWhitespaceToken)
        };
    }

    class NextTaskTypeWhitespaceToken : TypeWhitespaceToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NextTaskTypeArgumentToken)
        };
    }

    class NextTaskTypeArgumentToken : TypeArgumentToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NextTaskTypeArgumentEndToken),
            typeof(NextTaskTypeComma)
        };
    }

    class NextTaskTypeComma : TypeComma
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NextTaskTypeWhitespaceToken)
        };
    }

    class NextTaskTypeArgumentEndToken : TypeArgumentEndToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NextTaskWhitespaceToken)
        };
    }
}
