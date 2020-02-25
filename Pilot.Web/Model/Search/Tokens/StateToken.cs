using System;
using System.Collections.Generic;
using System.Linq;
using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Search.Tokens
{
    class StateToken : KeywordToken
    {
        public override string Alias => "State:";

        public override string Hint => "specify object's state";

        public override string SerializationAlias => SearchTokenAliases.StateTokenAlias;

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(StateWhitespaceToken)
        };

        public override bool IsValidAsNext(IList<IToken> expressionTokens)
        {
            return !expressionTokens.Any(x => x is StateToken);
        }
    }

    class StateWhitespaceToken : WhitespaceToken
    {
        public override bool IsTerminal => false;

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(StateArgumentToken),
        };
    }

    class StateArgumentToken : ArgumentToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(WhitespaceToken)
        };

        public override bool AllowCustomValues => false;

        public override string InvalidValueMessage => $"'{Value}' is not a valid state specification";

        public override bool SuggestIgnoringText => true;
    }
}
