using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search.QueryBuilder.Tools
{
    enum DateRange
    {
        Tomorrow,
        NextWeek,
        NextMonth,
        Today,
        Yesterday,
        ThisWeek,
        PrevWeek,
        ThisMonth,
        PrevMonth,
        ThisYear,
        PrevYear,
        LongAgo,
        Future,
    }

    class DatesRangeLimits
    {
        public DateTime FromUtc { get; private set; }
        public DateTime ToUtc { get; private set; }

        public DatesRangeLimits(DateTime fromLocal, DateTime toLocal)
        {
            FromUtc = fromLocal.ToUniversalTime();
            ToUtc = toLocal.ToUniversalTime();
        }

        public static DateTime GetStartOfTheWeek(DateTime date)
        {
            int diff = date.DayOfWeek - Thread.CurrentThread.CurrentCulture.DateTimeFormat.FirstDayOfWeek;
            if (diff < 0)
                diff += 7;

            return date.AddDays(-1 * diff).Date;
        }

        public static DateRange GetRange(DateTime value)
        {
            value = value.ToUniversalTime();

            foreach (DateRange dateRange in Enum.GetValues(typeof(DateRange)))
            {
                var range = GetRangeLimits(dateRange);
                if (value >= range.FromUtc && value <= range.ToUtc)
                    return dateRange;
            }

            return DateRange.Today;
        }

        public static DatesRangeLimits GetRangeLimits(DateTextArgumentToken presetToken)
        {
            var searchTokenPresetValue = presetToken.Value;
            var range = GetRangeFromSearchPresetString(searchTokenPresetValue);
            var rangeLimits = GetRangeLimits(range);

            if (presetToken.Context[RangeToken.RangeKindKey].Value is DateAttributeGreaterToken)
                return GreaterThanRange(rangeLimits);

            if (presetToken.Context[RangeToken.RangeKindKey].Value is DateAttributeLessToken)
                return LessThanRange(rangeLimits);

            return rangeLimits;
        }

        public static DatesRangeLimits GreaterThanRange(DatesRangeLimits baseLimits)
        {
            return new DatesRangeLimits(baseLimits.ToUtc.ToLocalTime(), DateTime.MaxValue);
        }

        public static DatesRangeLimits LessThanRange(DatesRangeLimits baseLimits)
        {
            return new DatesRangeLimits(DateTime.MinValue, baseLimits.FromUtc.ToLocalTime());
        }

        public static DatesRangeLimits GetRangeLimits(DateRange range)
        {
            var today = DateTime.Today;
            var weekStart = GetStartOfTheWeek(today);

            switch (range)
            {
                case DateRange.Future:
                    return new DatesRangeLimits(today.AddDays(-today.Day + 1).AddMonths(2), DateTime.MaxValue);

                case DateRange.NextMonth:
                    return new DatesRangeLimits(
                        today.AddDays(-today.Day + 1).AddMonths(1),
                        today.AddDays(-today.Day + 1).AddMonths(2).AddMilliseconds(-1));

                case DateRange.NextWeek:
                    return new DatesRangeLimits(weekStart.AddDays(14), weekStart.AddDays(14).AddMilliseconds(-1));

                case DateRange.Tomorrow:
                    return new DatesRangeLimits(today.AddDays(1), today.AddDays(2).AddMilliseconds(-1));

                case DateRange.Today:
                    return new DatesRangeLimits(today, today.AddDays(1).AddMilliseconds(-1));

                case DateRange.Yesterday:
                    return new DatesRangeLimits(today.AddDays(-1), today.AddMilliseconds(-1));

                case DateRange.ThisWeek:
                    return new DatesRangeLimits(weekStart, weekStart.AddDays(7).AddMilliseconds(-1));

                case DateRange.PrevWeek:
                    return new DatesRangeLimits(weekStart.AddDays(-7), weekStart.AddMilliseconds(-1));

                case DateRange.ThisMonth:
                    return new DatesRangeLimits(
                        today.AddDays(-today.Day + 1),
                        today.AddDays(-today.Day + 1).AddMonths(1).AddMilliseconds(-1));

                case DateRange.PrevMonth:
                    return new DatesRangeLimits(
                        today.AddDays(-today.Day + 1).AddMonths(-1),
                        today.AddDays(-today.Day + 1).AddMilliseconds(-1));

                case DateRange.ThisYear:
                    return new DatesRangeLimits(
                        today.AddDays(-today.Day + 1).AddMonths(-today.Month + 1),
                        today.AddDays(-today.Day + 1).AddMonths(-today.Month + 1).AddYears(1).AddMilliseconds(-1));

                case DateRange.PrevYear:
                    return new DatesRangeLimits(
                        today.AddDays(-today.Day + 1).AddMonths(-today.Month + 1).AddYears(-1),
                        today.AddDays(-today.Day + 1).AddMonths(-today.Month + 1).AddMilliseconds(-1));

                case DateRange.LongAgo:
                    return new DatesRangeLimits(
                        DateTime.MinValue,
                        today.AddDays(-today.Day + 1).AddMonths(-today.Month + 1).AddYears(-1).AddMilliseconds(-1));
            }

            throw new ArgumentException($"{range} range is not implemented");
        }

        public static DateRange GetRangeFromSearchPresetString(string presetValue)
        {
            if (string.Equals(presetValue, "today", StringComparison.InvariantCultureIgnoreCase))
                return DateRange.Today;

            if (string.Equals(presetValue, "yesterday", StringComparison.InvariantCultureIgnoreCase))
                return DateRange.Yesterday;

            if (string.Equals(presetValue, "this week", StringComparison.InvariantCultureIgnoreCase))
                return DateRange.ThisWeek;

            if (string.Equals(presetValue, "last week", StringComparison.InvariantCultureIgnoreCase))
                return DateRange.PrevWeek;

            if (string.Equals(presetValue, "this month", StringComparison.InvariantCultureIgnoreCase))
                return DateRange.ThisMonth;

            if (string.Equals(presetValue, "last month", StringComparison.InvariantCultureIgnoreCase))
                return DateRange.PrevMonth;

            if (string.Equals(presetValue, "this year", StringComparison.InvariantCultureIgnoreCase))
                return DateRange.ThisYear;

            if (string.Equals(presetValue, "last year", StringComparison.InvariantCultureIgnoreCase))
                return DateRange.PrevYear;

            throw new ArgumentException($"{presetValue} is not a valid date or range");
        }

        //public static string RangeToString(DateRange range)
        //{
        //    switch (range)
        //    {
        //        case DateRange.Future:
        //            return VisualElements.LocalizationResources.DateRangeFuture;

        //        case DateRange.Today:
        //            return VisualElements.LocalizationResources.DateTokenPresetToday;

        //        case DateRange.Yesterday:
        //            return VisualElements.LocalizationResources.DateTokenPresetYesterday;

        //        case DateRange.ThisWeek:
        //            return VisualElements.LocalizationResources.DateTokenPresetThisWeek;

        //        case DateRange.PrevWeek:
        //            return VisualElements.LocalizationResources.DateTokenPresetLastWeek;

        //        case DateRange.ThisMonth:
        //            return VisualElements.LocalizationResources.DateTokenPresetThisMounth;

        //        case DateRange.PrevMonth:
        //            return VisualElements.LocalizationResources.DateTokenPresetLastMounth;

        //        case DateRange.ThisYear:
        //            return VisualElements.LocalizationResources.DateTokenPresetThisYear;

        //        case DateRange.PrevYear:
        //            return VisualElements.LocalizationResources.DateTokenPresetLastYear;

        //        case DateRange.LongAgo:
        //            return VisualElements.LocalizationResources.DateRangeLongAgo;

        //        case DateRange.Tomorrow:
        //            return VisualElements.LocalizationResources.DateRangeTomorrow;

        //        case DateRange.NextWeek:
        //            return VisualElements.LocalizationResources.DateRangeNextWeek;

        //        case DateRange.NextMonth:
        //            return VisualElements.LocalizationResources.DateRangeNextMonth;
        //    }

        //    return range.ToString();
        //}
    }
}
