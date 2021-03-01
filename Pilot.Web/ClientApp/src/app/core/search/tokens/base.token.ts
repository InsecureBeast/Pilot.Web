import { TranslateService } from '@ngx-translate/core';

export abstract class SearchTokenBase {
    constructor(protected readonly translate: TranslateService) { }

    abstract get alias(): string;
    abstract get hint(): string;
    abstract get serializationAlias(): string;
    get isSuggestible(): boolean {
        return true;
    }

    abstract get nextTokens(): ReadonlyArray<SearchTokenBase>;
}





// export interface IToken {
//     validNexts: ReadonlyArray<IToken>;
//     isValidAsNext(expressionTokens: IToken[]): boolean;
// }

// export class TokenContext {

// }

// export abstract class TokenBase implements IToken {
//     static groupParentKey = 'GroupParent';
//     get isTerminal(): boolean { return true; }
//     abstract get validNexts(): ReadonlyArray<IToken>;
//     isValidAsNext(expressionTokens: IToken[]): boolean { return true; }
// }

// export abstract class ArgumentToken extends TokenBase implements IArgumentToken
//     {
//         private string _id;
//         private string _value;
//         private string _data;
//         protected bool _isValid = true;

//         public string Id => _id;
//         public string Data => _data;
//         public string Value => _value;
//         public bool IsValid => _isValid;

//         public IEnumerable<IPresetItem> GetPresetItems(ISearchExpressionContext context)
//         {
//             return context != null
//                 ? context.GetPresetItems(this)
//                 : new List<IPresetItem>();
//         }

//         public virtual IArgumentToken Parse(string expressionString, ISearchExpressionContext items)
//         {
//             var isArgumentValid = GetArgumentValue(expressionString, items, out var argumentValue);
//             var argumentToken = (ArgumentToken)GetInstance(GetType());

//             argumentToken._isValid = isArgumentValid && ValidateAttributeValue(argumentValue);
//             argumentToken._id = argumentValue.Id;
//             argumentToken._data = argumentValue.Data;
//             argumentToken._value = argumentValue.DisplayValue;
//             argumentToken.UpdateTokenContext(argumentToken._context);
//             return argumentToken;
//         }

//         public virtual bool ValidateAttributeValue(IPresetItem argumentValue)
//         {
//             return true;
//         }

//         public virtual string InvalidValueMessage => $"&apos;{Value}&apos; is not a valid argument value";

//         public override string ToString()
//         {
//             return Value;
//         }

//         protected internal void SetValue(IPresetItem value)
//         {
//             _id = value.Id;
//             _value = value.DisplayValue;
//         }

//         protected internal void SetIsValid(bool isValid)
//         {
//             _isValid = isValid;
//         }

//         public virtual bool AllowCustomValues => true;

//         public virtual bool SuggestIgnoringText => false;

//         protected virtual bool GetArgumentValue(string expressionString, ISearchExpressionContext context, out IPresetItem value)
//         {
//             IPresetItem validItem;
//             var presetArgumentLength = GetPresetArgumentLength(expressionString, context, out validItem);

//             if (presetArgumentLength > 0)
//             {
//                 value = validItem;
//                 return true;
//             }

//             value = new PresetItem(null, expressionString.Substring(0, GetArgumentLegth(expressionString, AllowCustomValues)));

//             return AllowCustomValues;
//         }

//         private int GetPresetArgumentLength(string expressionString, ISearchExpressionContext context, out IPresetItem validItem)
//         {
//             var presetItems = GetPresetItems(context);
//             var presetArgumentLength = -1;
//             validItem = null;

//             foreach (var item in presetItems)
//             {
//                 var itemValue = context.IsInvariantCulture ? item.Id : item.DisplayValue;
//                 if (itemValue == null)
//                     continue;

//                 if (expressionString.StartsWith(itemValue, StringComparison.InvariantCultureIgnoreCase) && itemValue.Length > presetArgumentLength)
//                 {
//                     if (expressionString.Length == itemValue.Length)
//                     {
//                         presetArgumentLength = itemValue.Length;
//                         validItem = item;
//                     }
//                     else
//                     {
//                         foreach (var validTail in ValidNexts.OfType<IKeywordToken>())
//                         {
//                             var keywordAlias = context.IsInvariantCulture
//                                 ? validTail.SerializationAlias
//                                 : validTail.Alias;

//                             var validTailIndex = expressionString.IndexOf(keywordAlias, itemValue.Length, StringComparison.InvariantCultureIgnoreCase);
//                             if (validTailIndex == itemValue.Length)
//                             {
//                                 presetArgumentLength = itemValue.Length;
//                                 validItem = item;
//                                 break;
//                             }
//                         }

//                         if (presetArgumentLength == -1)
//                         {
//                             presetArgumentLength = itemValue.Length;
//                             validItem = item;
//                         }
//                     }
//                 }
//             }

//             return presetArgumentLength;
//         }

//         private int GetArgumentLegth(string expressionString, bool allowCustomValues)
//         {
//             var argumentLength = expressionString.Length;

//             var validArgumentEndSymbols = allowCustomValues
//                 ? ValidNexts.OfType<IKeywordToken>().Select(x => x.Alias)
//                 : ValidNexts.OfType<IKeywordToken>().Select(x => x.Alias).Where(x => !string.IsNullOrWhiteSpace(x));

//             foreach (var endSymbol in validArgumentEndSymbols)
//             {
//                 var length = expressionString.IndexOf(endSymbol, StringComparison.InvariantCultureIgnoreCase);

//                 if (length != -1 && length < argumentLength)
//                     argumentLength = length;
//             }

//             return argumentLength;
//         }
//     }
