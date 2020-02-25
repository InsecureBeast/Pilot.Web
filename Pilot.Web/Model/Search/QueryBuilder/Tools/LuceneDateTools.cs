using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace Pilot.Web.Model.Search.QueryBuilder.Tools
{
    class LuceneDateTools
    {
        private static readonly string YEAR_FORMAT = "yyyy";
        private static readonly string MONTH_FORMAT = "yyyyMM";
        private static readonly string DAY_FORMAT = "yyyyMMdd";
        private static readonly string HOUR_FORMAT = "yyyyMMddHH";
        private static readonly string MINUTE_FORMAT = "yyyyMMddHHmm";
        private static readonly string SECOND_FORMAT = "yyyyMMddHHmmss";
        private static readonly string MILLISECOND_FORMAT = "yyyyMMddHHmmssfff";

        private LuceneDateTools()
        {
        }

        public static string DateToString(DateTime date, Resolution resolution)
        {
            return TimeToString(date.Ticks / 10000L, resolution);
        }

        public static string TimeToString(long time, Resolution resolution)
        {
            DateTime dateTime = new DateTime(Round(time, resolution));
            if (resolution == Resolution.YEAR)
                return dateTime.ToString(YEAR_FORMAT, CultureInfo.InvariantCulture);
            if (resolution == Resolution.MONTH)
                return dateTime.ToString(MONTH_FORMAT, CultureInfo.InvariantCulture);
            if (resolution == Resolution.DAY)
                return dateTime.ToString(DAY_FORMAT, CultureInfo.InvariantCulture);
            if (resolution == Resolution.HOUR)
                return dateTime.ToString(HOUR_FORMAT, CultureInfo.InvariantCulture);
            if (resolution == Resolution.MINUTE)
                return dateTime.ToString(MINUTE_FORMAT, CultureInfo.InvariantCulture);
            if (resolution == Resolution.SECOND)
                return dateTime.ToString(SECOND_FORMAT, CultureInfo.InvariantCulture);
            if (resolution == Resolution.MILLISECOND)
                return dateTime.ToString(MILLISECOND_FORMAT, CultureInfo.InvariantCulture);
            throw new ArgumentException("unknown resolution " + resolution);
        }

        public static long StringToTime(string dateString)
        {
            return StringToDate(dateString).Ticks;
        }

        public static DateTime StringToDate(string dateString)
        {
            DateTime dateTime;
            if (dateString.Length == 4)
                dateTime = new DateTime(Convert.ToInt16(dateString.Substring(0, 4)), 1, 1, 0, 0, 0, 0);
            else if (dateString.Length == 6)
                dateTime = new DateTime(Convert.ToInt16(dateString.Substring(0, 4)), Convert.ToInt16(dateString.Substring(4, 2)), 1, 0, 0, 0, 0);
            else if (dateString.Length == 8)
                dateTime = new DateTime(Convert.ToInt16(dateString.Substring(0, 4)), Convert.ToInt16(dateString.Substring(4, 2)), Convert.ToInt16(dateString.Substring(6, 2)), 0, 0, 0, 0);
            else if (dateString.Length == 10)
                dateTime = new DateTime(Convert.ToInt16(dateString.Substring(0, 4)), Convert.ToInt16(dateString.Substring(4, 2)), Convert.ToInt16(dateString.Substring(6, 2)), Convert.ToInt16(dateString.Substring(8, 2)), 0, 0, 0);
            else if (dateString.Length == 12)
                dateTime = new DateTime(Convert.ToInt16(dateString.Substring(0, 4)), Convert.ToInt16(dateString.Substring(4, 2)), Convert.ToInt16(dateString.Substring(6, 2)), Convert.ToInt16(dateString.Substring(8, 2)), Convert.ToInt16(dateString.Substring(10, 2)), 0, 0);
            else if (dateString.Length == 14)
            {
                dateTime = new DateTime(Convert.ToInt16(dateString.Substring(0, 4)), Convert.ToInt16(dateString.Substring(4, 2)), Convert.ToInt16(dateString.Substring(6, 2)), Convert.ToInt16(dateString.Substring(8, 2)), Convert.ToInt16(dateString.Substring(10, 2)), Convert.ToInt16(dateString.Substring(12, 2)), 0);
            }
            else
            {
                if (dateString.Length != 17)
                    throw new FormatException("Input is not valid date string: " + dateString);
                dateTime = new DateTime(Convert.ToInt16(dateString.Substring(0, 4)), Convert.ToInt16(dateString.Substring(4, 2)), Convert.ToInt16(dateString.Substring(6, 2)), Convert.ToInt16(dateString.Substring(8, 2)), Convert.ToInt16(dateString.Substring(10, 2)), Convert.ToInt16(dateString.Substring(12, 2)), Convert.ToInt16(dateString.Substring(14, 3)));
            }
            return dateTime;
        }

        public static DateTime Round(DateTime date, Resolution resolution)
        {
            return new DateTime(Round(date.Ticks / 10000L, resolution));
        }

        public static long Round(long time, Resolution resolution)
        {
            DateTime dateTime = new DateTime(time * 10000L);
            if (resolution == Resolution.YEAR)
            {
                dateTime = dateTime.AddMonths(1 - dateTime.Month);
                dateTime = dateTime.AddDays(1 - dateTime.Day);
                dateTime = dateTime.AddHours(-dateTime.Hour);
                dateTime = dateTime.AddMinutes(-dateTime.Minute);
                dateTime = dateTime.AddSeconds(-dateTime.Second);
                dateTime = dateTime.AddMilliseconds(-dateTime.Millisecond);
            }
            else if (resolution == Resolution.MONTH)
            {
                dateTime = dateTime.AddDays(1 - dateTime.Day);
                dateTime = dateTime.AddHours(-dateTime.Hour);
                dateTime = dateTime.AddMinutes(-dateTime.Minute);
                dateTime = dateTime.AddSeconds(-dateTime.Second);
                dateTime = dateTime.AddMilliseconds(-dateTime.Millisecond);
            }
            else if (resolution == Resolution.DAY)
            {
                dateTime = dateTime.AddHours(-dateTime.Hour);
                dateTime = dateTime.AddMinutes(-dateTime.Minute);
                dateTime = dateTime.AddSeconds(-dateTime.Second);
                dateTime = dateTime.AddMilliseconds(-dateTime.Millisecond);
            }
            else if (resolution == Resolution.HOUR)
            {
                dateTime = dateTime.AddMinutes(-dateTime.Minute);
                dateTime = dateTime.AddSeconds(-dateTime.Second);
                dateTime = dateTime.AddMilliseconds(-dateTime.Millisecond);
            }
            else if (resolution == Resolution.MINUTE)
            {
                dateTime = dateTime.AddSeconds(-dateTime.Second);
                dateTime = dateTime.AddMilliseconds(-dateTime.Millisecond);
            }
            else if (resolution == Resolution.SECOND)
                dateTime = dateTime.AddMilliseconds(-dateTime.Millisecond);
            else if (resolution != Resolution.MILLISECOND)
                throw new ArgumentException("unknown resolution " + resolution);
            return dateTime.Ticks;
        }

        /// <summary>Specifies the time granularity. </summary>
        public class Resolution
        {
            public static readonly Resolution YEAR = new Resolution("year");
            public static readonly Resolution MONTH = new Resolution("month");
            public static readonly Resolution DAY = new Resolution("day");
            public static readonly Resolution HOUR = new Resolution("hour");
            public static readonly Resolution MINUTE = new Resolution("minute");
            public static readonly Resolution SECOND = new Resolution("second");
            public static readonly Resolution MILLISECOND = new Resolution("millisecond");
            private readonly string _resolution;

            internal Resolution()
            {
            }

            internal Resolution(string resolution)
            {
                _resolution = resolution;
            }

            public override string ToString()
            {
                return _resolution;
            }
        }
    }
}
