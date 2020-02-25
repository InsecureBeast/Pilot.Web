using System;
using System.Collections.Generic;
using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Search.Tokens
{
    #region snapshot tokens
    class SnapshotReasonToken : KeywordToken
    {
        private readonly List<Type> _validNexts = new List<Type>
        {
            typeof(SnapshotReasonWhitespaceToken)
        };

        public override string Alias => "Replacement reason:";

        public override string Hint => "search for a specified replacement reason";

        public override string SerializationAlias => SearchTokenAliases.SnapshotReasonAlias;

        protected override List<Type> ValidNextTypes => _validNexts;
    }

    class SnapshotReasonWhitespaceToken : WhitespaceToken
    {
        public override bool IsTerminal => false;

        private readonly List<Type> _validNexts = new List<Type>
        {
            typeof(SnapshotReasonArgumentToken)
        };

        protected override List<Type> ValidNextTypes => _validNexts;
    }

    class SnapshotReasonArgumentToken : ArgumentToken
    {
        private readonly List<Type> _validNexts = new List<Type>
        {
            typeof(SnapshotReasonArgumentEndToken)
        };

        protected override List<Type> ValidNextTypes => _validNexts;

        public override bool AllowCustomValues => true;
    }

    class SnapshotReasonComma : CommaToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(SnapshotReasonWhitespaceToken),
        };

        public override string Hint => "add reason specification";
    }

    class SnapshotReasonArgumentEndToken : EndToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(WhitespaceToken),
        };

        public override string Hint => "end replacement reasons specification";
    }
    #endregion
}
