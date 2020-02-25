using System;
using System.Collections.Generic;
using Ascon.Pilot.Common;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search.NextTasksSearchExpression.Tokens
{
    class NextTaskMySearchToken : KeywordToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NextTaskWhitespaceToken)
        };

        public override string Alias => "My;";
        public override string Hint => "all my tasks";
        public override string SerializationAlias => SearchTokenAliases.AllMyTokenAlias;
    }
}
