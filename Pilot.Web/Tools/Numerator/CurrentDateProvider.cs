using System;
using System.Collections.Generic;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools.Numerator
{
    public class CurrentDateProvider : INumeratorKeywordProvider<INObject>
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

        public IEnumerable<object> GetValues(INObject obj, string keyword)
        {
            return new[] { GetValue(obj, keyword) };
        }
    }
}
