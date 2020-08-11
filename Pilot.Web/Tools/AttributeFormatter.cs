using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Ascon.Pilot.Common;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools
{
    public static class AttributeFormatter
    {
        public static IReadOnlyDictionary<string, DValue> Format(INType objectType, IReadOnlyDictionary<string, DValue> values)
        {
            var cloneValues = values.ToDictionary(k => k.Key, v => v.Value.Clone());
            if (objectType == null)
                return cloneValues;

            foreach (var value in cloneValues)
            {
                var attribute = objectType.Attributes.FirstOrDefault(a => a.Name.Equals(value.Key));
                if (attribute == null)
                    continue;

                var format = attribute.ParsedConfiguration().Format;
                if (string.IsNullOrEmpty(format))
                    continue;

                try
                {
                    if (value.Value.DoubleValue != null)
                    {
                        value.Value.StrValue = string.Format(format, value.Value.DoubleValue.Value);
                        continue;
                    }

                    if (value.Value.DateValue != null)
                    {
                        value.Value.StrValue = string.Format(format, value.Value.DateValue.Value);
                        continue;
                    }

                    if (value.Value.IntValue != null)
                    {
                        value.Value.StrValue = string.Format(format, value.Value.IntValue.Value);
                        continue;
                    }

                    if (value.Value.StrValue != null)
                    {
                        value.Value.StrValue = string.Format(format, value.Value.StrValue);
                    }

                    if (value.Value.DecimalValue != null)
                    {
                        var cultureName = attribute.ParsedConfiguration().Culture;
                        var cultureInfo = !string.IsNullOrEmpty(cultureName)
                            ? new CultureInfo(cultureName)
                            : CultureInfo.CurrentUICulture;

                        value.Value.StrValue = string.Format(cultureInfo, format, value.Value.DecimalValue);
                    }
                }
                catch (FormatException) { }
            }
            return cloneValues;
        }

        public static DValue ToDValue(this string value)
        {
            if (Guid.TryParse(value, out var guid))
                return new DValue { GuidValue = guid};

            if (int.TryParse(value, out var i))
                return new DValue { IntValue = i};

            if (double.TryParse(value, out var d))
                return new DValue { DoubleValue = d};

            if (decimal.TryParse(value, out var dc))
                return new DValue { DecimalValue = dc };

            if (DateTime.TryParse(value, out var dt))
                return new DValue { DateValue = dt };

            //TODO int array and string[]

            return new DValue {StrValue = value};
        }

    }
}
