using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Search.Tokens
{
    class AttributeToken : KeywordToken
    {
        public override string Alias => "Attribute";

        public override string Hint => "specify an attribute value";

        public override string SerializationAlias => SearchTokenAliases.AttributeTokenAlias;

        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(AttributeNameWhitespaceToken)
        };
    }

    class AttributeNameWhitespaceToken : NonTerminalWhitespaceToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(StringAttributeNameToken),
            typeof(DateAttributeNameToken),
            typeof(NumberAttributeNameToken),
            typeof(FloatNumberAttributeNameToken),
            typeof(UserStateAttributeNameToken),
            typeof(OrgUnitAttributeNameToken),
        };
    }

    #region base attribute tokens
    abstract class AttributeNameTokenBase : ArgumentToken
    {
        public override bool AllowCustomValues => false;

        public override string InvalidValueMessage => $"&apos;{Value}&apos; is not a valid attribute name";

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            context[nameof(AttributeNameTokenBase)] = new ContextItem(Data, typeof(AttributeArgumentEndToken));
        }
    }

    abstract class AttributeWhitespaceTokenBase : NonTerminalWhitespaceToken
    {
        public override string Alias => SearchTokenAliases.AttributeWhitespaceAlias;
    }

    abstract class AttributeCommaBase : CommaToken
    {
        public override string Hint => "add attribute specification";
    }
    #endregion

    #region user state attributes
    class UserStateAttributeNameToken : AttributeNameTokenBase
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(UserStateAttributeWhitespaceToken),
        };
    }

    public class UserStateAttributeWhitespaceToken : NonTerminalWhitespaceToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(UserStateAttributeValueToken),
            typeof(AttributeIsSetToken)
        };

        public override string Alias => SearchTokenAliases.AttributeWhitespaceAlias;
    }

    class UserStateAttributeValueToken : ArgumentToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(AttributeArgumentEndToken),
            typeof(UserStateAttributeComma)
        };

        public override bool AllowCustomValues => false;

        public override string InvalidValueMessage => $"&apos;{Value}&apos; is not a valid state specification";
    }

    public class UserStateAttributeValueListWhitespaceToken : NonTerminalWhitespaceToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(UserStateAttributeValueToken),
        };
    }

    class UserStateAttributeComma : AttributeCommaBase
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(UserStateAttributeValueListWhitespaceToken),
        };
    }
    #endregion

    #region string attributes
    class StringAttributeNameToken : AttributeNameTokenBase
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(StringAttributeWhitespaceToken),
        };
    }

    class StringAttributeWhitespaceToken : AttributeWhitespaceTokenBase
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(StringAttributeValueToken),
            typeof(AttributeIsSetToken)
        };

        public override string Alias => SearchTokenAliases.AttributeWhitespaceAlias;
    }

    class StringAttributeValueToken : ArgumentToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(AttributeArgumentEndToken),
            typeof(StringAttributeComma)
        };

        public override bool AllowCustomValues => true;

        public override string InvalidValueMessage => string.Empty;

        public override bool ValidateAttributeValue(IPresetItem argumentValue)
        {
            return base.ValidateAttributeValue(argumentValue) && !string.IsNullOrEmpty(argumentValue?.DisplayValue);
        }
    }

    class StringAttributeValueListWhitespaceToken : NonTerminalWhitespaceToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(StringAttributeValueToken),
        };
    }

    class StringAttributeComma : AttributeCommaBase
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(StringAttributeValueListWhitespaceToken),
        };
    }
    #endregion

    #region date attributes
    class DateAttributeNameToken : AttributeNameTokenBase
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
        }
    }

    class DateAttributeWhitespaceToken : DateWhitespaceToken
    {
        protected override List<Type> ValidNextTypes
        {
            get
            {
                return base.ValidNextTypes.Concat(new[] { typeof(AttributeIsSetToken) }).ToList();
            }
        }

        public override string Alias => SearchTokenAliases.AttributeWhitespaceAlias;
    }
    #endregion

    #region number attributes
    class NumberAttributeNameToken : AttributeNameTokenBase
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NumberAttributeWhitespaceToken),
        };

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            context[RangeToken.AllowRangeKey] = new ContextItem(true, typeof(NumberAttributeRangeToken), typeof(NumberAttributeGreaterToken), typeof(NumberAttributeLessToken));
        }
    }

    class NumberAttributeWhitespaceToken : AttributeWhitespaceTokenBase
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NumberAttributeValueToken),
            typeof(NumberAttributeGreaterToken),
            typeof(NumberAttributeLessToken),
            typeof(AttributeIsSetToken)
        };
    }

    class NumberAttributeGreaterToken : KeywordToken
    {
        public override string Alias => ">";
        public override string Hint => "greater than";
        public override string SerializationAlias => Alias;

        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(SingleNumberAttributeValueToken),
        };

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            context[GroupParentKey] = new ContextItem(this, typeof(AttributeArgumentEndToken));
        }
    }

    class NumberAttributeLessToken : KeywordToken
    {
        public override string Alias => "<";
        public override string Hint => "less than";
        public override string SerializationAlias => Alias;

        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(SingleNumberAttributeValueToken),
        };

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            context[GroupParentKey] = new ContextItem(this, typeof(AttributeArgumentEndToken));
        }
    }

    class SingleNumberAttributeValueToken : NumberAttributeValueToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(AttributeArgumentEndToken)
        };
    }

    class NumberAttributeValueToken : ArgumentToken
    {
        protected override List<Type> ValidNextTypes
        {
            get
            {
                var tokens = new List<Type>
                {
                    typeof(AttributeArgumentEndToken),
                    typeof(NumberAttributeComma)
                };

                var allowRange = _context[RangeToken.AllowRangeKey].Value;
                if ((bool?)allowRange == true)
                    tokens.Insert(0, typeof(NumberAttributeRangeToken));

                return tokens;
            }
        }

        public override bool AllowCustomValues => true;

        public override string InvalidValueMessage => $"&apos;{Value}&apos; is not a number";

        public override bool ValidateAttributeValue(IPresetItem argumentValue)
        {
            if (argumentValue?.DisplayValue == null)
                return true;

            var valid = double.TryParse(argumentValue.DisplayValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var value);

            return valid && value <= long.MaxValue && value >= long.MinValue;
        }

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            if (_context[GroupParentKey].Value == null)
                context[GroupParentKey] = new ContextItem(this, typeof(NumberAttributeComma), typeof(AttributeArgumentEndToken));
        }
    }

    class NumberAttributeValueListWhitespaceToken : NonTerminalWhitespaceToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(NumberAttributeValueToken),
        };
    }

    class NumberAttributeComma : AttributeCommaBase
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(NumberAttributeValueListWhitespaceToken),
        };

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            context[RangeToken.AllowRangeKey] = new ContextItem(true, typeof(NumberAttributeRangeToken));
        }
    }

    class NumberAttributeRangeToken : RangeToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(NumberAttributeValueToken)
        };

        public override string Alias => SearchTokenAliases.DateRangeTokenAlias;

        public override string SerializationAlias => Alias;

        public override string Hint => "specify values range";

        protected override void UpdateTokenContext(TokenContext context)
        {
            _context[IsRangeTopKey] = new ContextItem(true, typeof(NumberAttributeComma), typeof(AttributeArgumentEndToken));
            base.UpdateTokenContext(context);
        }
    }

    class FloatNumberAttributeNameToken : NumberAttributeNameToken
    {
        protected override void UpdateTokenContext(TokenContext context)
        {
            context[nameof(FloatNumberAttributeNameToken)] = new ContextItem(this, typeof(AttributeArgumentEndToken));
            base.UpdateTokenContext(context);
        }
    }
    #endregion

    #region org unit attribute
    class OrgUnitAttributeNameToken : AttributeNameTokenBase
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(OrgUnitAttributeWhitespaceToken),
        };
    }

    class OrgUnitAttributeWhitespaceToken : AttributeWhitespaceTokenBase
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(OrgUnitMeArgumentToken),
            typeof(OrgUnitAttributeValueToken),
            typeof(AttributeIsSetToken)
        };
    }

    class OrgUnitAttributeValueToken : ArgumentToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(AttributeArgumentEndToken),
            typeof(OrgUnitAttributeComma)
        };

        public override bool AllowCustomValues => false;

        public override string InvalidValueMessage => $"&apos;{Value}&apos; is not valid author specification";
    }

    class OrgUnitMeArgumentToken : OrgUnitAttributeValueToken
    {
    }

    class OrgUnitAttributeValueListWhitespaceToken : NonTerminalWhitespaceToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(OrgUnitAttributeValueToken),
        };
    }

    class OrgUnitAttributeComma : AttributeCommaBase
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(OrgUnitAttributeValueListWhitespaceToken),
        };
    }
    #endregion

    #region attribute is set/unset tokens
    class AttributeIsSetToken : KeywordToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(AttributeArgumentEndToken)
        };

        public override string Alias => "Is set";
        public override string Hint => "Attribute value is set";
        public override string SerializationAlias => SearchTokenAliases.SetTokenAlias;
    }
    #endregion

    class AttributeArgumentEndToken : EndToken
    {
        protected override List<Type> ValidNextTypes
        {
            get
            {
                var whiteSpaceToken = Context[nameof(AttributeArgumentEndToken)].Value as Type ?? typeof(WhitespaceToken);
                return new List<Type> { whiteSpaceToken };
            }
        }

        public override string Hint => "end attribute specification";
    }
}
