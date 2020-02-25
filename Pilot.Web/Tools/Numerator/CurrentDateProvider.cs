using System;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools.Numerator
{
    public class CurrentDateProvider : INumeratorKeywordProvider
    {
        public const string CURRENT_DATE_KEYWORD = "CurrentDate";
        private readonly bool _deferred;

        public CurrentDateProvider(bool deferred)
        {
            _deferred = deferred;
        }

        public object GetValue(INObject obj, string keyword)
        {
            if (keyword != CURRENT_DATE_KEYWORD)
                return null;

            return _deferred ? (object)"***" : DateTime.Now;
        }
    }
}
