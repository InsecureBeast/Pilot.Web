using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Search.Tokens
{
    #region TokenContext
    public interface ITokenContext
    {
        ContextItem this[string key] { get; }
    }

    public class TokenContext : ITokenContext
    {
        protected Dictionary<string, ContextItem> _context = new Dictionary<string, ContextItem>();

        public IEnumerable<string> Keys => _context.Keys;

        public ContextItem this[string key]
        {
            get => _context.ContainsKey(key) ? _context[key] : new ContextItem(null);
            set => _context[key] = value;
        }
    }

    public class ContextItem
    {
        public object Value { get; private set; }
        public Type[] ValidUpTo { get; private set; }

        public ContextItem(object value, params Type[] validUpTo)
        {
            Value = value;
            ValidUpTo = validUpTo ?? new Type[0];
        }
    }
    #endregion

    #region Token interfaces
    public interface IToken
    {
        ReadOnlyCollection<IToken> ValidNexts { get; }
        bool IsValidAsNext(IList<IToken> expressionTokens);
    }

    public interface IKeywordToken : IToken
    {
        string Alias { get; }
        string Hint { get; }
        string SerializationAlias { get; }
        bool IsSuggestible { get; }
    }

    interface IArgumentToken : IToken
    {
        string Value { get; }
        string Id { get; }
        bool IsValid { get; }
        bool AllowCustomValues { get; }
        bool SuggestIgnoringText { get; }
        IEnumerable<IPresetItem> GetPresetItems(ISearchExpressionContext items);
        IArgumentToken Parse(string expression, ISearchExpressionContext items);
        string InvalidValueMessage { get; }
    }
    #endregion

    #region BaseTokens
    public abstract class TokenBase
    {
        public virtual bool IsTerminal => true;

        public static string GroupParentKey = "GroupParent";

        protected TokenContext _context = new TokenContext();

        public ITokenContext Context { get { return _context; } }

        public ReadOnlyCollection<IToken> ValidNexts
        {
            get
            {
                return new ReadOnlyCollection<IToken>(ValidNextTypes.Select(x => GetInstance(x)).ToList());
            }
        }

        public virtual bool IsValidAsNext(IList<IToken> expressionTokens)
        {
            return true;
        }

        protected abstract List<Type> ValidNextTypes { get; }

        public virtual IToken GetInstance(Type type)
        {
            var instance = (IToken)Activator.CreateInstance(type);
            UpdateTokenContext(((TokenBase)instance)._context);
            return instance;
        }

        protected virtual void UpdateTokenContext(TokenContext context)
        {
            if (ReferenceEquals(context, _context))
                return;

            foreach (var key in _context.Keys)
            {
                if (!_context[key].ValidUpTo.Contains(GetType()))
                    context[key] = _context[key];
            }
        }
    }

    public abstract class KeywordToken : TokenBase, IKeywordToken
    {
        public abstract string Alias { get; }
        public abstract string Hint { get; }
        public abstract string SerializationAlias { get; }

        public virtual bool IsSuggestible => true;

        public override string ToString()
        {
            return Alias;
        }
    }

    abstract class ArgumentToken : TokenBase, IArgumentToken
    {
        private string _id;
        private string _value;
        private string _data;
        protected bool _isValid = true;

        public string Id => _id;
        public string Data => _data;
        public string Value => _value;
        public bool IsValid => _isValid;

        public IEnumerable<IPresetItem> GetPresetItems(ISearchExpressionContext context)
        {
            return context != null
                ? context.GetPresetItems(this)
                : new List<IPresetItem>();
        }

        public virtual IArgumentToken Parse(string expressionString, ISearchExpressionContext items)
        {
            var isArgumentValid = GetArgumentValue(expressionString, items, out var argumentValue);
            var argumentToken = (ArgumentToken)GetInstance(GetType());

            argumentToken._isValid = isArgumentValid && ValidateAttributeValue(argumentValue);
            argumentToken._id = argumentValue.Id;
            argumentToken._data = argumentValue.Data;
            argumentToken._value = argumentValue.DisplayValue;
            argumentToken.UpdateTokenContext(argumentToken._context);
            return argumentToken;
        }

        public virtual bool ValidateAttributeValue(IPresetItem argumentValue)
        {
            return true;
        }

        public virtual string InvalidValueMessage => $"&apos;{Value}&apos; is not a valid argument value";

        public override string ToString()
        {
            return Value;
        }

        protected internal void SetValue(IPresetItem value)
        {
            _id = value.Id;
            _value = value.DisplayValue;
        }

        protected internal void SetIsValid(bool isValid)
        {
            _isValid = isValid;
        }

        public virtual bool AllowCustomValues => true;

        public virtual bool SuggestIgnoringText => false;

        protected virtual bool GetArgumentValue(string expressionString, ISearchExpressionContext context, out IPresetItem value)
        {
            IPresetItem validItem;
            var presetArgumentLength = GetPresetArgumentLength(expressionString, context, out validItem);

            if (presetArgumentLength > 0)
            {
                value = validItem;
                return true;
            }

            value = new PresetItem(null, expressionString.Substring(0, GetArgumentLegth(expressionString, AllowCustomValues)));

            return AllowCustomValues;
        }

        private int GetPresetArgumentLength(string expressionString, ISearchExpressionContext context, out IPresetItem validItem)
        {
            var presetItems = GetPresetItems(context);
            var presetArgumentLength = -1;
            validItem = null;

            foreach (var item in presetItems)
            {
                var itemValue = context.IsInvariantCulture ? item.Id : item.DisplayValue;
                if (itemValue == null)
                    continue;

                if (expressionString.StartsWith(itemValue, StringComparison.InvariantCultureIgnoreCase) && itemValue.Length > presetArgumentLength)
                {
                    if (expressionString.Length == itemValue.Length)
                    {
                        presetArgumentLength = itemValue.Length;
                        validItem = item;
                    }
                    else
                    {
                        foreach (var validTail in ValidNexts.OfType<IKeywordToken>())
                        {
                            var keywordAlias = context.IsInvariantCulture
                                ? validTail.SerializationAlias
                                : validTail.Alias;

                            var validTailIndex = expressionString.IndexOf(keywordAlias, itemValue.Length, StringComparison.InvariantCultureIgnoreCase);
                            if (validTailIndex == itemValue.Length)
                            {
                                presetArgumentLength = itemValue.Length;
                                validItem = item;
                                break;
                            }
                        }

                        if (presetArgumentLength == -1)
                        {
                            presetArgumentLength = itemValue.Length;
                            validItem = item;
                        }
                    }
                }
            }

            return presetArgumentLength;
        }

        private int GetArgumentLegth(string expressionString, bool allowCustomValues)
        {
            var argumentLength = expressionString.Length;

            var validArgumentEndSymbols = allowCustomValues
                ? ValidNexts.OfType<IKeywordToken>().Select(x => x.Alias)
                : ValidNexts.OfType<IKeywordToken>().Select(x => x.Alias).Where(x => !string.IsNullOrWhiteSpace(x));

            foreach (var endSymbol in validArgumentEndSymbols)
            {
                var length = expressionString.IndexOf(endSymbol, StringComparison.InvariantCultureIgnoreCase);

                if (length != -1 && length < argumentLength)
                    argumentLength = length;
            }

            return argumentLength;
        }
    }
    #endregion

    public abstract class WhitespaceTokenBase : KeywordToken
    {
        public override string Alias => SearchTokenAliases.WhitespaceAlias;

        public override string SerializationAlias => Alias;

        public override string Hint => "whitespace";
    }

    public abstract class NonTerminalWhitespaceToken : WhitespaceTokenBase
    {
        public sealed override bool IsTerminal => false;
    }

    public class WhitespaceToken : WhitespaceTokenBase
    {
        public const string TERM_OCCUR = "TermOccur";

        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(WhitespaceToken),
            typeof(MustNotToken),
            typeof(SearchPhraseToken),
            typeof(StartQuotedSearchPhraseToken),
            typeof(TypeToken),
            typeof(AuthorToken),
            typeof(CreatedKeywordToken),
            typeof(AttributeToken),
            typeof(SnapshotCreatedKeywordToken),
            typeof(SnapshotReasonToken),
            typeof(StateToken),
            typeof(SearchContextToken)
        };
    }

    public abstract class CommaToken : KeywordToken
    {
        public override string Alias => SearchTokenAliases.SeparatorAlias;

        public override string SerializationAlias => Alias;
    }

    public abstract class EndToken : KeywordToken
    {
        public override string Alias => SearchTokenAliases.EndAlias;

        public override string SerializationAlias => Alias;
    }

    public class MustNotToken : KeywordToken
    {
        protected override List<Type> ValidNextTypes { get; } = new List<Type>
        {
            typeof(SearchPhraseToken),
            typeof(StartQuotedSearchPhraseToken),
            typeof(TypeToken),
            typeof(AuthorToken),
            typeof(CreatedKeywordToken),
            typeof(AttributeToken),
            typeof(SnapshotCreatedKeywordToken),
            typeof(SnapshotReasonToken),
            typeof(StateToken),
            typeof(SearchContextToken)
        };

        public override string Alias => SearchTokenAliases.MustNotAlias;
        public override string Hint => "Exclude from search results";
        public override string SerializationAlias => Alias;

        protected override void UpdateTokenContext(TokenContext context)
        {
            context[WhitespaceToken.TERM_OCCUR] = new ContextItem(TermOccur.MustNot, typeof(WhitespaceToken));
            base.UpdateTokenContext(context);
        }
    }

    class UnexpectedToken : ArgumentToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>();
    }

    public enum TermOccur
    {
        Must,
        MustNot
    }
}
