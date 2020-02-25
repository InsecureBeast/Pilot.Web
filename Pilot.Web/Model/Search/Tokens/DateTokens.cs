using System;
using System.Collections.Generic;
using System.Globalization;
using Ascon.Pilot.Common;

namespace Pilot.Web.Model.Search.Tokens
{
    #region Created and Changed tokens

    abstract class DateKeywordBaseToken : KeywordToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(DateWhitespaceToken)
        };

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            context[GroupParentKey] = new ContextItem(this, typeof(DateArgumentEndToken));
            context[RangeToken.AllowRangeKey] = new ContextItem(true, typeof(DateRangeToken));
        }
    }

    class CreatedKeywordToken : DateKeywordBaseToken
    {
        public override string Alias => "Created:";

        public override string Hint => "specify creation time";

        public override string SerializationAlias => SearchTokenAliases.CreatedTokenAlias;
    }

    class ChangedKeywordToken : DateKeywordBaseToken
    {
        public override string Alias => "Changed:";

        public override string Hint => "specify modification time";

        public override string SerializationAlias => SearchTokenAliases.ChangedTokenAlias;
    }

    class SnapshotCreatedKeywordToken : DateKeywordBaseToken
    {
        public override string Alias => "Version created:";

        public override string Hint => "specify version creation time";

        public override string SerializationAlias => SearchTokenAliases.SnapshotCreatedTokenAlias;
    }

    class DateWhitespaceToken : WhitespaceToken
    {
        public override bool IsTerminal => false;

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(YearToken),
            typeof(DateTextArgumentToken),
            typeof(DateAttributeGreaterToken),
            typeof(DateAttributeLessToken),
        };

        protected override void UpdateTokenContext(TokenContext context)
        {
            context[RangeToken.RangeGroupKey] =
                new ContextItem(Guid.NewGuid(),
                typeof(DateCommaToken),
                typeof(DateArgumentEndToken));

            base.UpdateTokenContext(context);
        }
    }

    class DateAttributeGreaterToken : KeywordToken
    {
        public override string Alias => ">";
        public override string Hint => "later than";
        public override string SerializationAlias => Alias;

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(YearToken),
            typeof(DateTextArgumentToken),
        };

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            context[RangeToken.RangeKindKey] = new ContextItem(this, typeof(DateArgumentEndToken), typeof(DateCommaToken));
            context[RangeToken.AllowRangeKey] = new ContextItem(false, typeof(DateArgumentEndToken));
        }
    }

    class DateAttributeLessToken : KeywordToken
    {
        public override string Alias => "<";
        public override string SerializationAlias => Alias;
        public override string Hint => " earlier than";

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(YearToken),
            typeof(DateTextArgumentToken),
        };

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            context[RangeToken.RangeKindKey] = new ContextItem(this, typeof(DateArgumentEndToken), typeof(DateCommaToken));
            context[RangeToken.AllowRangeKey] = new ContextItem(false, typeof(DateArgumentEndToken));
        }
    }

    class DateCommaToken : CommaToken
    {
        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(DateWhitespaceToken),
        };

        public override string Hint => "one more date specification";

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            context[RangeToken.AllowRangeKey] = new ContextItem(true, typeof(DateRangeToken));
        }
    }

    class DateArgumentEndToken : EndToken
    {
        protected override List<Type> ValidNextTypes
        {
            get
            {
                var whiteSpaceToken = Context[nameof(DateArgumentEndToken)].Value as Type ?? typeof(WhitespaceToken);
                return new List<Type> { whiteSpaceToken };
            }
        }

        public override string Hint => "end date specification";

        protected override void UpdateTokenContext(TokenContext context)
        {
            base.UpdateTokenContext(context);
            context[RangeToken.AllowRangeKey] = new ContextItem(true, typeof(DateRangeToken));
        }
    }

    class DateRangeToken : RangeToken
    {
        public static string FullDateStringFormat = "yyyy-MM-dd";
        public static string ShortDateStringFormat = "yyyy-MM";

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(YearToken),
        };

        public override string Hint => "specify dates range";

        protected override void UpdateTokenContext(TokenContext context)
        {
            _context[IsRangeTopKey] = new ContextItem(true, typeof(DateCommaToken), typeof(DateArgumentEndToken));
            base.UpdateTokenContext(context);
        }
    }

    class DateTextArgumentToken : ArgumentToken
    {
        public static string Today = SearchTokenAliases.TodayAlias;
        public static string Yesterday = SearchTokenAliases.YesterdayAlias;
        public static string ThisWeek = SearchTokenAliases.ThisWeekAlias;
        public static string LastWeek = SearchTokenAliases.LastWeekAlias;
        public static string ThisMonth = SearchTokenAliases.ThisMonthAlias;
        public static string LastMonth = SearchTokenAliases.LastMonthAlias;
        public static string ThisYear = SearchTokenAliases.ThisYearAlias;
        public static string LastYear = SearchTokenAliases.LastYearAlias;

        protected override List<Type> ValidNextTypes
        {
            get
            {
                var validNexts = new List<Type>
                {
                    typeof(DateArgumentEndToken),
                };

                if (Context[RangeToken.RangeKindKey].Value == null)
                    validNexts.Add(typeof(DateCommaToken));

                return validNexts;
            }
        }

        public override bool SuggestIgnoringText => true;

        public override bool AllowCustomValues => false;

        public override string InvalidValueMessage => $"'{Value}' is not a valid period specification";
    }

    abstract class DateArgumentToken : ArgumentToken
    {
        private DateTime _dateTime;
        protected abstract string DateTimeParsingStringFromat { get; }

        public DateTime DateTime
        {
            get => _dateTime;
            private set
            {
                _dateTime = value;
                UpdateDateTime(_dateTime);
            }
        }

        protected abstract void UpdateDateTime(DateTime dateTime);

        protected DateTime GetFromValue()
        {
            var contextItemValue = _context[DateRangeToken.FromValueKey].Value;
            return contextItemValue as DateTime? ?? DateTime.MinValue;
        }

        protected void SetFromValue(DateTime value)
        {
            _context[RangeToken.FromValueKey] = new ContextItem(value, typeof(DateArgumentEndToken), typeof(DateCommaToken));
        }

        protected DateTime GetToValue()
        {
            var contextItemValue = _context[RangeToken.ToValueKey].Value;
            return contextItemValue as DateTime? ?? DateTime.MinValue;
        }

        protected void SetToValue(DateTime value)
        {
            _context[RangeToken.ToValueKey] = new ContextItem(value, typeof(DateArgumentEndToken), typeof(DateCommaToken));
        }

        public bool GetIsTopSubgroup()
        {
            return _context[RangeToken.IsRangeTopKey].Value != null;
        }

        public override IArgumentToken Parse(string expressionString, ISearchExpressionContext items)
        {
            var argumentToken = (DateArgumentToken)base.Parse(expressionString, items);

            GetArgumentValue(expressionString, items, out var argumentValue);
            if (!DateTime.TryParseExact(argumentValue.DisplayValue, DateTimeParsingStringFromat, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dateTime))
                argumentToken.SetIsValid(false);
            else
                argumentToken.DateTime = dateTime;

            return argumentToken;
        }
    }

    class YearToken : DateArgumentToken
    {
        protected override string DateTimeParsingStringFromat => SearchTokenAliases.YearTokenAlias;

        public override string InvalidValueMessage => $"'{Value}' is not a valid year specification";

        protected override List<Type> ValidNextTypes
        {
            get
            {
                var tokens = new List<Type>
                {
                    typeof(YearMonthSeparatorToken),
                    typeof(DateArgumentEndToken),
                };

                if (Context[RangeToken.RangeKindKey].Value == null)
                    tokens.Add(typeof(DateCommaToken));

                var allowRange = _context[RangeToken.AllowRangeKey].Value;
                if (allowRange is bool && (bool)allowRange)
                    tokens.Insert(1, typeof(DateRangeToken));

                return tokens;
            }
        }

        protected override void UpdateDateTime(DateTime dateTime)
        {
            var isTopSubgroup = GetIsTopSubgroup();

            if (isTopSubgroup)
            {
                SetToValue(dateTime.AddMilliseconds(-1));
                return;
            }

            SetFromValue(dateTime);
            SetToValue(dateTime.AddYears(1).AddMilliseconds(-1));
        }
    }

    class YearMonthSeparatorToken : KeywordToken
    {
        public override string Alias => SearchTokenAliases.YearMonthSeparatorAlias;

        public override string Hint => "specify a month";

        public override string SerializationAlias => Alias;

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(MonthToken)
        };
    }

    abstract class RangeToken : KeywordToken
    {
        public static string AllowRangeKey = "AllowRange";
        public static string RangeGroupKey = "RangeGroup";
        public static string IsRangeTopKey = "RangeTop";
        public static string FromValueKey = "FromValue";
        public static string ToValueKey = "ToValue";
        public static string RangeKindKey = "RangeKind";

        public override bool IsTerminal => false;

        public override string Alias => SearchTokenAliases.DateRangeTokenAlias;

        public override string SerializationAlias => Alias;
    }

    class MonthToken : DateArgumentToken
    {
        protected override string DateTimeParsingStringFromat => SearchTokenAliases.MonthTokenAlias;

        public override string InvalidValueMessage => $"'{Value}' is not a valid month specification";

        protected override List<Type> ValidNextTypes
        {
            get
            {
                var tokens = new List<Type>
                {
                    typeof(MonthDaySeparatorToken),
                    typeof(DateArgumentEndToken),
                };

                if (Context[RangeToken.RangeKindKey].Value == null)
                    tokens.Add(typeof(DateCommaToken));

                var allowRange = _context[RangeToken.AllowRangeKey].Value;
                if (allowRange is bool && (bool)allowRange)
                    tokens.Insert(1, typeof(DateRangeToken));

                return tokens;
            }
        }

        protected override void UpdateDateTime(DateTime dateTime)
        {
            var isTopSubgroup = GetIsTopSubgroup();

            if (isTopSubgroup)
            {
                var toValue = GetToValue();
                SetToValue(toValue.AddMonths(dateTime.Month - 1).AddMilliseconds(-1));
                return;
            }

            var fromValue = GetFromValue();
            var newFromValue = fromValue.AddMonths(dateTime.Month - 1);
            SetFromValue(newFromValue);
            SetToValue(newFromValue.AddMonths(1).AddMilliseconds(-1));
        }

        public override bool AllowCustomValues
        {
            get { return false; }
        }
    }

    class MonthDaySeparatorToken : KeywordToken
    {
        public override string Alias => SearchTokenAliases.MonthDaySeparatorAlias;

        public override string Hint => "specify a day";

        public override string SerializationAlias => Alias;

        protected override List<Type> ValidNextTypes => new List<Type>
        {
            typeof(DayToken)
        };
    }

    class DayToken : DateArgumentToken
    {
        protected override string DateTimeParsingStringFromat => SearchTokenAliases.DayTokenAlias;

        public override string InvalidValueMessage => $"'{Value}' is not a valid date of a month specification";

        protected override List<Type> ValidNextTypes
        {
            get
            {
                var tokens = new List<Type>
                {
                    typeof(DateArgumentEndToken),
                };

                if (Context[RangeToken.RangeKindKey].Value == null)
                    tokens.Add(typeof(DateCommaToken));

                var allowRange = _context[RangeToken.AllowRangeKey].Value;
                if (allowRange is bool && (bool)allowRange)
                    tokens.Insert(1, typeof(DateRangeToken));

                return tokens;
            }
        }

        protected override void UpdateDateTime(DateTime dateTime)
        {
            var isTopSubgroup = GetIsTopSubgroup();

            if (isTopSubgroup)
            {
                var toValue = GetToValue();
                SetToValue(toValue.AddDays(dateTime.Day - 1).AddMilliseconds(-1));
                return;
            }

            var fromValue = GetFromValue();
            var newFromValue = fromValue.AddDays(dateTime.Day - 1);
            SetFromValue(newFromValue);
            SetToValue(newFromValue.AddDays(1).AddMilliseconds(-1));
        }

        public override bool AllowCustomValues => false;
    }
    #endregion
}
