using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search
{
    class SearchExpression : ISearchExpression
    {
        private readonly ISearchExpressionContext _context;
        private readonly List<IToken> _tokens;
        private bool _isValid;
        private string _asString;

        public SearchExpression(IToken startToken, string expressionString, ISearchExpressionContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _tokens = new List<IToken> { startToken };
            _isValid = true;
            _asString = AsString();
            Parse(expressionString, _context);
        }

        public ReadOnlyCollection<IToken> Tokens => new ReadOnlyCollection<IToken>(_tokens);

        public IToken LastToken => _tokens.Last();

        public int TokensCount => _tokens.Count;

        public bool IsValid => _isValid;

        public bool IsEmpty => string.IsNullOrWhiteSpace(ToString());

        public bool IsIncomplete
        {
            get
            {
                var lastToken = LastToken as TokenBase;
                return lastToken != null && !lastToken.IsTerminal;
            }
        }

        private void Parse(string expressionString, ISearchExpressionContext searchExpressionContext)
        {
            if (string.IsNullOrWhiteSpace(expressionString))
                return;

            while (!string.IsNullOrEmpty(expressionString))
            {
                var prevExpressionString = expressionString;

                if (TryParseAsKeyword(ref expressionString, this))
                    continue;

                if (TryParseAsArgument(ref expressionString, this, searchExpressionContext))
                    continue;

                if (prevExpressionString == expressionString)
                {
                    var unexpectedString = expressionString.Substring(0, 1);
                    expressionString = expressionString.Remove(0, 1);

                    var unexpectedToken = LastToken as UnexpectedToken;
                    if (unexpectedToken != null)
                    {
                        var newValue = unexpectedToken.Value + unexpectedString;
                        unexpectedToken.SetValue(new PresetItem(newValue, newValue));
                    }
                    else
                    {
                        unexpectedToken = new UnexpectedToken();
                        unexpectedToken.SetValue(new PresetItem(unexpectedString, unexpectedString));
                        AddToken(unexpectedToken);
                    }

                    _isValid = false;
                }

                _isValid = false;
            }

            _asString = AsString();
        }

        public override string ToString()
        {
            return _asString;
        }

        public override bool Equals(object obj)
        {
            var other = obj as SearchExpression;

            return other != null && string.Equals(ToString(), other.ToString(), StringComparison.InvariantCultureIgnoreCase);
        }

        public override int GetHashCode()
        {
            return ToString().ToLower().GetHashCode();
        }

        public ReadOnlyCollection<IToken> GetValidNexts(int? tokenIndex = null)
        {
            if (!tokenIndex.HasValue)
                tokenIndex = Tokens.Count - 1;

            var token = Tokens[tokenIndex.Value];

            if (token is UnexpectedToken && tokenIndex > 0)
                token = Tokens[tokenIndex.Value - 1];

            var nextTokens = token.ValidNexts.Where(x => x.IsValidAsNext(Tokens));
            var validTokens = _context.ValidateNextTokens(this, token, nextTokens.ToList());
            return new ReadOnlyCollection<IToken>(validTokens);
        }

        private static bool TryParseAsKeyword(ref string expressionString, SearchExpression expression)
        {
            foreach (var nextKeyword in expression.GetValidNexts().OfType<IKeywordToken>())
            {
                var alias = expression._context.IsInvariantCulture ? nextKeyword.SerializationAlias : nextKeyword.Alias;
                if (expressionString.StartsWith(alias, StringComparison.InvariantCultureIgnoreCase))
                {
                    expressionString = expressionString.Remove(0, alias.Length);
                    expression.AddToken(nextKeyword);
                    return true;
                }
            }

            return false;
        }

        private static bool TryParseAsArgument(ref string expressionString, SearchExpression expression, ISearchExpressionContext items)
        {
            var nextArgumentTokens = expression.GetValidNexts().OfType<IArgumentToken>().OrderBy(x => !x.GetPresetItems(items).Any()).ToList();

            var validCases = new List<IArgumentToken>();
            for (var index = 0; index < nextArgumentTokens.Count; index++)
            {
                var isLastToken = index == nextArgumentTokens.Count - 1;
                var token = nextArgumentTokens[index];
                var newArgumentToken = token.Parse(expressionString, items);
                if (!newArgumentToken.IsValid && !isLastToken)
                    continue;

                if (newArgumentToken.IsValid || !validCases.Any())
                    validCases.Add(newArgumentToken);
            }

            if (!validCases.Any())
                return false;

            validCases = validCases.OrderBy(x => GetValueLength(items, x)).ToList();
            var bestCaseToken = validCases.Last();
            var valueLength = GetValueLength(items, bestCaseToken);

            expressionString = expressionString.Remove(0, valueLength);
            expression.AddToken(bestCaseToken);
            return bestCaseToken.IsValid;
        }

        private static int GetValueLength(ISearchExpressionContext items, IArgumentToken token)
        {
            return items.IsInvariantCulture && token.Id != null
                ? token.Id.Length
                : token.Value.Length;
        }

        private void AddToken(IToken newToken)
        {
            _tokens.Add(newToken);
            _asString = AsString();
        }

        private string AsString()
        {
            var stringBuilder = new StringBuilder();
            _tokens.ForEach(x => stringBuilder.Append(x.ToString()));
            return stringBuilder.ToString().TrimStart();
        }
    }
}
