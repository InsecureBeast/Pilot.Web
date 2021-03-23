using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Search.Tokens
{
    class SignatureAwaitingToken : KeywordToken
    {
        public override string Alias => "Awaiting signature by:";

        public override string Hint => "specify signer";

        public override string SerializationAlias => SearchTokenAliases.SignatureAwaitingTokenAlias;

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(SignatureAwaitingWhitespaceToken)
        };
    }

    class SignatureAwaitingArgumentToken : OrgUnitArgumentToken
    {
        public override string InvalidValueMessage => $"\"{Value}\" is not valid specification";

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(SignatureAwaitingEndArgumentToken),
            typeof(SignatureAwaitingCommaToken)
        };
    }

    public class SignatureAwaitingWhitespaceToken : NonTerminalWhitespaceToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(SignatureAwaitingWhitespaceToken),
            typeof(SignatureAwaitingArgumentToken)
        };
    }

    public class SignatureAwaitingCommaToken : CommaToken
    {
        public override string Hint => "add signer";

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(SignatureAwaitingWhitespaceToken)
        };
    }

    public class SignatureAwaitingEndArgumentToken : EndToken
    {
        public override string Hint => "end signer specification";

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(WhitespaceToken)
        };
    }

    public class SignedToken : KeywordToken
    {
        public override string Alias => "Signed by:";

        public override string Hint => "specify signer";

        public override string SerializationAlias => SearchTokenAliases.SignedTokenAlias;

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(SignedWhitespaceToken)
        };
    }

    class SignedArgumentToken : OrgUnitArgumentToken
    {
        public override string InvalidValueMessage => $"\"{Value}\" is not valid specification";

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(SignedEndArgumentToken),
            typeof(SignedCommaToken)
        };
    }

    class SignedWhitespaceToken : NonTerminalWhitespaceToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(SignedWhitespaceToken),
            typeof(SignedArgumentToken)
        };
    }

    class SignedCommaToken : CommaToken
    {
        public override string Hint => "add signer";

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(SignedWhitespaceToken)
        };
    }

    public class SignedEndArgumentToken : EndToken
    {
        public override string Hint => "end signer specification";

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(WhitespaceToken)
        };
    }
}
