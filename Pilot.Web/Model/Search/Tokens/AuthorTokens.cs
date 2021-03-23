using System;
using System.Collections.Generic;
using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Search.Tokens
{
    class AuthorToken : KeywordToken
    {
        public override string Alias => "Author:";

        public override string Hint => "specify author";

        public override string SerializationAlias => SearchTokenAliases.AuthorTokenAlias;

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(AuthorWhitespaceToken)
        };
    }

    class AuthorWhitespaceToken : WhitespaceToken
    {
        public override bool IsTerminal => false;

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(AuthorWhitespaceToken),
            typeof(AuthorArgumentToken)
        };
    }

    class AuthorArgumentToken : ArgumentToken
    {
        public override string InvalidValueMessage => $"'{Value}' is not valid author specification";

        public override bool AllowCustomValues => false;

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(AuthorEndArgumentToken),
            typeof(AuthorCommaToken)
        };
    }

    abstract class OrgUnitArgumentToken : ArgumentToken
    {
        public override bool AllowCustomValues => false;
    }

    class AuthorCommaToken : CommaToken
    {
        public override string Hint => "add author";

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(AuthorWhitespaceToken)
        };
    }

    class AuthorEndArgumentToken : EndToken
    {
        public override string Hint => "end author specification";

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(WhitespaceToken)
        };
    }
}
