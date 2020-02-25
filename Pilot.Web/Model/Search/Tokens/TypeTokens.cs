using System;
using System.Collections.Generic;
using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Search.Tokens
{
    #region type tokens
    class TypeToken : KeywordToken
    {
        private readonly List<Type> _validNexts = new List<Type>
        {
            typeof(TypeWhitespaceToken)
        };

        public override string Alias => "File type:";

        public override string Hint => "specify a type";

        public override string SerializationAlias => SearchTokenAliases.TypeTokenAlias;

        protected override List<Type> ValidNextTypes => _validNexts;
    }

    class TypeWhitespaceToken : WhitespaceToken
    {
        public override bool IsTerminal => false;

        private readonly List<Type> _validNexts = new List<Type>
        {
            typeof(TypeArgumentToken)
        };

        protected override List<Type> ValidNextTypes => _validNexts;
    }

    class TypeArgumentToken : ArgumentToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(TypeArgumentEndToken),
            typeof(TypeComma)
        };

        public override bool AllowCustomValues => false;
        public override string InvalidValueMessage => $"'{Value}' is not a valid type name";

        protected override void UpdateTokenContext(TokenContext context)
        {
            var typesSpecified = new List<string> { Id };

            var contextItem = context[nameof(TypeArgumentToken)];
            if (contextItem.Value is List<string> typesPreviouslySpecified)
                typesSpecified.AddRange(typesPreviouslySpecified);

            context[nameof(TypeArgumentToken)] = new ContextItem(typesSpecified);

            base.UpdateTokenContext(context);
        }
    }

    class TypeComma : CommaToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(TypeWhitespaceToken),
        };

        public override string Hint => "add type";
    }

    class TypeArgumentEndToken : EndToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(WhitespaceToken),
        };

        public override string Hint => "end type specification";
    }
    #endregion
}
