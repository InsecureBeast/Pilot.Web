// import { IToken } from './base.token';
// import { KeywordToken, NonTerminalWhitespaceToken } from './keyword.token';
// import { SearchTokenAliases } from './search-token.aliases';

// abstract class AttributeNameTokenBase extends ArgumentToken
//     {
//         public override bool AllowCustomValues => false;

//         public override string InvalidValueMessage => $"&apos;{Value}&apos; is not a valid attribute name";

//         protected override void UpdateTokenContext(TokenContext context)
//         {
//             base.UpdateTokenContext(context);
//             context[nameof(AttributeNameTokenBase)] = new ContextItem(Data, typeof(AttributeArgumentEndToken));
//         }
//     }

// export class StringAttributeNameToken extends AttributeNameTokenBase
//     {
//         protected override List<Type> ValidNextTypes { get; } = new List<Type>
//         {
//             typeof(StringAttributeWhitespaceToken),
//         };
//     }

//     class StringAttributeWhitespaceToken : AttributeWhitespaceTokenBase
//     {
//         protected override List<Type> ValidNextTypes { get; } = new List<Type>
//         {
//             typeof(StringAttributeValueToken),
//             typeof(StringAttributeIsSetToken)
//         };

//         public override string Alias => SearchTokenAliases.AttributeWhitespaceAlias;
//     }

//     class StringAttributeValueToken : ArgumentToken
//     {
//         protected override List<Type> ValidNextTypes { get; } = new List<Type>
//         {
//             typeof(AttributeArgumentEndToken),
//             typeof(StringAttributeComma)
//         };

//         public override bool AllowCustomValues => true;

//         public override string InvalidValueMessage => string.Empty;

//         public override bool ValidateAttributeValue(IPresetItem argumentValue)
//         {
//             return base.ValidateAttributeValue(argumentValue) && !string.IsNullOrEmpty(argumentValue?.DisplayValue);
//         }
//     }

//     class StringAttributeValueListWhitespaceToken : NonTerminalWhitespaceToken
//     {
//         protected override List<Type> ValidNextTypes { get; } = new List<Type>
//         {
//             typeof(StringAttributeValueToken),
//         };
//     }

//     class StringAttributeComma : AttributeCommaBase
//     {
//         protected override List<Type> ValidNextTypes => new List<Type>
//         {
//             typeof(StringAttributeValueListWhitespaceToken),
//         };
//     }

// export class AttributeNameWhitespaceToken extends NonTerminalWhitespaceToken {

//     get validNexts(): readonly IToken[] {
//         const nexts = new Array<IToken>();
//         nexts.push(new StringAttributeNameToken(this.translate));
//         nexts.push(new DateAttributeNameToken(this.translate));
//         nexts.push(new IntegerNumberAttributeNameToken(this.translate));
//         nexts.push(new FloatNumberAttributeNameToken(this.translate));
//         nexts.push(new UserStateAttributeNameToken(this.translate));
//         nexts.push(new OrgUnitAttributeNameToken(this.translate));
//         return nexts;
//     }
// }

// export class AttributeToken extends KeywordToken {

//     get alias(): string {
//         return this.translate.instant('attributeTokenAlias');
//     }
//     get hint(): string {
//         return this.translate.instant('attributeTokenAliasHint');
//     }
//     get serializationAlias(): string {
//         return SearchTokenAliases.attributeTokenAlias;
//     }
//     get validNexts(): IToken[] {
//         const nexts = new Array<IToken>();
//         nexts.push(new AttributeNameWhitespaceToken(this.translate));
//         return nexts;
//     }
// }


//     // #region base attribute tokens
    

//     // abstract class AttributeCommaBase : CommaToken
//     // {
//     //     public override string Hint => "add attribute specification";
//     // }
//     // #endregion

//     // #region user state attributes
//     // class UserStateAttributeNameToken : AttributeNameTokenBase
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(UserStateAttributeWhitespaceToken),
//     //     };
//     // }

//     // public class UserStateAttributeWhitespaceToken : NonTerminalWhitespaceToken
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(UserStateAttributeValueToken),
//     //         typeof(AttributeIsSetToken)
//     //     };

//     //     public override string Alias => SearchTokenAliases.AttributeWhitespaceAlias;
//     // }

//     // class UserStateAttributeValueToken : ArgumentToken
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(AttributeArgumentEndToken),
//     //         typeof(UserStateAttributeComma)
//     //     };

//     //     public override bool AllowCustomValues => false;

//     //     public override string InvalidValueMessage => $"&apos;{Value}&apos; is not a valid state specification";
//     // }

//     // public class UserStateAttributeValueListWhitespaceToken : NonTerminalWhitespaceToken
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(UserStateAttributeValueToken),
//     //         typeof(UserStateAttributeIsSetToken)
//     //     };
//     // }

//     // class UserStateAttributeComma : AttributeCommaBase
//     // {
//     //     protected override List<Type> ValidNextTypes => new List<Type>
//     //     {
//     //         typeof(UserStateAttributeValueListWhitespaceToken),
//     //     };
//     // }
//     // #endregion

//     // #region string attributes
    
//     // #endregion

//     // #region date attributes
//     // class DateAttributeNameToken : AttributeNameTokenBase
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(DateAttributeWhitespaceToken),
//     //     };

//     //     protected override void UpdateTokenContext(TokenContext context)
//     //     {
//     //         base.UpdateTokenContext(context);
//     //         context[GroupParentKey] = new ContextItem(this, typeof(DateArgumentEndToken));
//     //         context[RangeToken.AllowRangeKey] = new ContextItem(true, typeof(DateRangeToken));
//     //     }
//     // }

//     // class DateAttributeWhitespaceToken : DateWhitespaceToken
//     // {
//     //     protected override List<Type> ValidNextTypes
//     //     {
//     //         get
//     //         {
//     //             return base.ValidNextTypes.Concat(new[] { typeof(DateTimeAttributeIsSetToken) }).ToList();
//     //         }
//     //     }

//     //     public override string Alias => SearchTokenAliases.AttributeWhitespaceAlias;
//     // }
//     // #endregion

//     // #region number attributes
//     // class IntegerNumberAttributeNameToken : AttributeNameTokenBase
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(IntegerNumberAttributeWhitespaceToken),
//     //     };

//     //     protected override void UpdateTokenContext(TokenContext context)
//     //     {
//     //         base.UpdateTokenContext(context);
//     //         context[RangeToken.AllowRangeKey] = new ContextItem(true, typeof(NumberAttributeRangeToken), typeof(NumberAttributeGreaterToken), typeof(NumberAttributeLessToken));
//     //     }
//     // }

//     // abstract class NumberAttributeWhitespaceTokenBase : AttributeWhitespaceTokenBase
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(NumberAttributeValueToken),
//     //         typeof(NumberAttributeGreaterToken),
//     //         typeof(NumberAttributeLessToken)
//     //     };
//     // }

//     // class IntegerNumberAttributeWhitespaceToken : NumberAttributeWhitespaceTokenBase
//     // {
//     //     protected override List<Type> ValidNextTypes
//     //     {
//     //         get
//     //         {
//     //             return base.ValidNextTypes.Union(new[] { typeof(IntegerNumberAttributeIsSetToken) }).ToList();
//     //         }
//     //     }
//     // }

//     // public class NumberAttributeGreaterToken : KeywordToken
//     // {
//     //     public override string Alias => ">";
//     //     public override string Hint => "Greater then";
//     //     public override string SerializationAlias => Alias;

//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(SingleNumberAttributeValueToken),
//     //     };

//     //     protected override void UpdateTokenContext(TokenContext context)
//     //     {
//     //         base.UpdateTokenContext(context);
//     //         context[GroupParentKey] = new ContextItem(this, typeof(AttributeArgumentEndToken));
//     //     }
//     // }

//     // class NumberAttributeLessToken : KeywordToken
//     // {
//     //     public override string Alias => "<";
//     //     public override string Hint => "Less then";
//     //     public override string SerializationAlias => Alias;

//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(SingleNumberAttributeValueToken),
//     //     };

//     //     protected override void UpdateTokenContext(TokenContext context)
//     //     {
//     //         base.UpdateTokenContext(context);
//     //         context[GroupParentKey] = new ContextItem(this, typeof(AttributeArgumentEndToken));
//     //     }
//     // }

//     // class SingleNumberAttributeValueToken : NumberAttributeValueToken
//     // {
//     //     protected override List<Type> ValidNextTypes => new List<Type>
//     //     {
//     //         typeof(AttributeArgumentEndToken)
//     //     };
//     // }

//     // class NumberAttributeValueToken : ArgumentToken
//     // {
//     //     protected override List<Type> ValidNextTypes
//     //     {
//     //         get
//     //         {
//     //             var tokens = new List<Type>
//     //             {
//     //                 typeof(AttributeArgumentEndToken),
//     //                 typeof(NumberAttributeComma)
//     //             };

//     //             var allowRange = _context[RangeToken.AllowRangeKey].Value;
//     //             if ((bool?)allowRange == true)
//     //                 tokens.Insert(0, typeof(NumberAttributeRangeToken));

//     //             return tokens;
//     //         }
//     //     }

//     //     public override bool AllowCustomValues => true;

//     //     public override string InvalidValueMessage => $"'{Value}' is not a nubmer or contains too much digits";

//     //     public override bool ValidateAttributeValue(IPresetItem argumentValue)
//     //     {
//     //         if (argumentValue?.DisplayValue == null)
//     //             return true;

//     //         var valid = double.TryParse(argumentValue.DisplayValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var value);

//     //         return valid && value <= long.MaxValue && value >= long.MinValue;
//     //     }

//     //     protected override void UpdateTokenContext(TokenContext context)
//     //     {
//     //         base.UpdateTokenContext(context);
//     //         if (_context[GroupParentKey].Value == null)
//     //             context[GroupParentKey] = new ContextItem(this, typeof(NumberAttributeComma), typeof(AttributeArgumentEndToken));
//     //     }
//     // }

//     // public class NumberAttributeValueListWhitespaceToken : NonTerminalWhitespaceToken
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(NumberAttributeValueToken),
//     //     };
//     // }

//     // class NumberAttributeComma : AttributeCommaBase
//     // {
//     //     protected override List<Type> ValidNextTypes => new List<Type>
//     //     {
//     //         typeof(NumberAttributeValueListWhitespaceToken),
//     //     };

//     //     protected override void UpdateTokenContext(TokenContext context)
//     //     {
//     //         base.UpdateTokenContext(context);
//     //         context[RangeToken.AllowRangeKey] = new ContextItem(true, typeof(NumberAttributeRangeToken));
//     //     }
//     // }

//     // class NumberAttributeRangeToken : RangeToken
//     // {
//     //     protected override List<Type> ValidNextTypes => new List<Type>
//     //     {
//     //         typeof(NumberAttributeValueToken)
//     //     };

//     //     public override string Alias => SearchTokenAliases.DateRangeTokenAlias;

//     //     public override string SerializationAlias => Alias;

//     //     public override string Hint => "specify values range";

//     //     protected override void UpdateTokenContext(TokenContext context)
//     //     {
//     //         _context[IsRangeTopKey] = new ContextItem(true, typeof(NumberAttributeComma), typeof(AttributeArgumentEndToken));
//     //         base.UpdateTokenContext(context);
//     //     }
//     // }

//     // class FloatNumberAttributeNameToken : AttributeNameTokenBase
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(FloatNumberAttributeWhitespaceToken),
//     //     };

//     //     protected override void UpdateTokenContext(TokenContext context)
//     //     {
//     //         context[nameof(FloatNumberAttributeNameToken)] = new ContextItem(this, typeof(AttributeArgumentEndToken));
//     //         base.UpdateTokenContext(context);
//     //         context[RangeToken.AllowRangeKey] = new ContextItem(true, typeof(NumberAttributeRangeToken), typeof(NumberAttributeGreaterToken), typeof(NumberAttributeLessToken));
//     //     }
//     // }

//     // class FloatNumberAttributeWhitespaceToken : NumberAttributeWhitespaceTokenBase
//     // {
//     //     protected override List<Type> ValidNextTypes
//     //     {
//     //         get
//     //         {
//     //             return base.ValidNextTypes.Union(new[] { typeof(FloatNumberAttributeIsSetToken) }).ToList();
//     //         }
//     //     }
//     // }
//     // #endregion

//     // #region org unit attribute
//     // class OrgUnitAttributeNameToken : AttributeNameTokenBase
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(OrgUnitAttributeWhitespaceToken),
//     //     };
//     // }

//     // class OrgUnitAttributeWhitespaceToken : AttributeWhitespaceTokenBase
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(OrgUnitMeArgumentToken),
//     //         typeof(OrgUnitAttributeValueToken),
//     //         typeof(OrgUnitAttributeIsSetToken)
//     //     };
//     // }

//     // class OrgUnitAttributeValueToken : ArgumentToken
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(AttributeArgumentEndToken),
//     //         typeof(OrgUnitAttributeComma)
//     //     };

//     //     public override bool AllowCustomValues => false;

//     //     public override string InvalidValueMessage => $"&apos;{Value}&apos; is not valid author specification";
//     // }

//     // class OrgUnitMeArgumentToken : OrgUnitAttributeValueToken
//     // {
//     // }

//     // class OrgUnitAttributeValueListWhitespaceToken : NonTerminalWhitespaceToken
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(OrgUnitAttributeValueToken),
//     //     };
//     // }

//     // class OrgUnitAttributeComma : AttributeCommaBase
//     // {
//     //     protected override List<Type> ValidNextTypes => new List<Type>
//     //     {
//     //         typeof(OrgUnitAttributeValueListWhitespaceToken),
//     //     };
//     // }
//     // #endregion

//     // #region attribute is set/unset tokens
//     // class AttributeIsSetToken : KeywordToken
//     // {
//     //     protected override List<Type> ValidNextTypes { get; } = new List<Type>
//     //     {
//     //         typeof(AttributeArgumentEndToken)
//     //     };

//     //     public override string Alias => "Is set";
//     //     public override string Hint => "Attribute value is set";
//     //     public override string SerializationAlias => SearchTokenAliases.SetTokenAlias;
//     // }
//     // #endregion

//     // class AttributeArgumentEndToken : EndToken
//     // {
//     //     protected override List<Type> ValidNextTypes
//     //     {
//     //         get
//     //         {
//     //             var whiteSpaceToken = Context[nameof(AttributeArgumentEndToken)].Value as Type ?? typeof(WhitespaceToken);
//     //             return new List<Type> { whiteSpaceToken };
//     //         }
//     //     }

//     //     public override string Hint => "end attribute specification";
//     // }

//     // class StringAttributeIsSetToken : AttributeIsSetToken
//     // {
//     // }

//     // class UserStateAttributeIsSetToken : AttributeIsSetToken
//     // {
//     // }

//     // class DateTimeAttributeIsSetToken : AttributeIsSetToken
//     // {
//     // }

//     // class IntegerNumberAttributeIsSetToken : AttributeIsSetToken
//     // {
//     // }

//     // class FloatNumberAttributeIsSetToken : AttributeIsSetToken
//     // {
//     // }

//     // class OrgUnitAttributeIsSetToken : AttributeIsSetToken
//     // {
//     // }