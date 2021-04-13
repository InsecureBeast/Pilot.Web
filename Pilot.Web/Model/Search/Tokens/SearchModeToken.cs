using System;
using System.Collections.Generic;
using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Search.Tokens
{
    class SearchModeToken : KeywordToken
    {
        public SearchModeToken()
        {
            IsSuggestible = true;
        }

        public SearchModeToken(bool isSuggestable)
        {
            IsSuggestible = isSuggestable;
        }

        protected override List<Type> ValidNextTypes =>
            new List<Type>
            {
                typeof(SearchModeWhitespaceToken)
            };

        public override bool IsSuggestible { get; }

        public override string Alias => "Mode";

        public override string Hint => "search mode switch";

        public override string SerializationAlias => SearchTokenAliases.SearchModeAlias;
    }

    public class SearchModeWhitespaceToken : NonTerminalWhitespaceToken
    {
        protected override List<Type> ValidNextTypes =>
            new List<Type>
            {
                typeof(SearchModeArgumentToken)
            };
    }

    class SearchModeArgumentToken : ArgumentToken
    {
        public SearchTarget SearchTarget
        {
            get
            {
                if (Value == "search by files\\")
                    return SearchTarget.Files;

                if (Value == "search by attributes\\")
                    return SearchTarget.Attributes;

                if (Value == "search by files and attributes\\")
                    return SearchTarget.Attributes | SearchTarget.Files;

                return SearchTarget.Attributes;
            }
        }

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(WhitespaceToken)
        };

        public override bool AllowCustomValues => false;

        public override bool SuggestIgnoringText => true;
    }

    [Flags]
    enum SearchTarget
    {
        None = 0,
        Attributes = 1,
        Files = 2
    }
}
