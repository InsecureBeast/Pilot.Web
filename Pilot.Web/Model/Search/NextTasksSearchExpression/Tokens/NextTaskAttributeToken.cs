using System;
using System.Collections.Generic;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search.NextTasksSearchExpression.Tokens
{
    class NextTaskAttributeToken : AttributeToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NextTaskAttributeNameWhitespaceToken)
        };
    }

    class NextTaskAttributeNameWhitespaceToken : AttributeNameWhitespaceToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(StringAttributeNameToken),
            typeof(NextTaskDateAttributeNameToken),
            typeof(NumberAttributeNameToken),
            typeof(FloatNumberAttributeNameToken),
            typeof(UserStateAttributeNameToken),
            typeof(OrgUnitAttributeNameToken),
        };

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            context[nameof(AttributeArgumentEndToken)] = new ContextItem(value: typeof(NextTaskWhitespaceToken), validUpTo: typeof(AttributeArgumentEndToken));
        }
    }

    #region date attributes
    class NextTaskDateAttributeNameToken : DateAttributeNameToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(DateAttributeWhitespaceToken),
        };

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            context[GroupParentKey] = new ContextItem(this, typeof(DateArgumentEndToken));
            context[RangeToken.AllowRangeKey] = new ContextItem(true, typeof(DateRangeToken));
            context[nameof(DateArgumentEndToken)] = new ContextItem(typeof(NextTaskWhitespaceToken));
        }
    }
    #endregion
}
