using System;
using System.Collections.Generic;
using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Search.Tokens
{
    class FileTypeToken : KeywordToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(FileTypeWhitespaceToken)
        };

        public override string Alias => "File type:";

        public override string Hint => "specify file type";

        public override string SerializationAlias => SearchTokenAliases.FileTypeTokenAlias;
    }

    class FileTypeWhitespaceToken : WhitespaceToken
    {
        public override bool IsTerminal => false;

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(FileTypeArgumentToken)
        };
    }

    class FileTypeArgumentToken : ArgumentToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(WhitespaceToken)
        };
    }

    class FileTypeArgumentComma : CommaToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(FileTypeWhitespaceToken),
        };

        public override string Hint => "add type";
    }
}
