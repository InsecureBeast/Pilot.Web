using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using Ascon.Pilot.Common;
using Ascon.Pilot.DataClasses;
using Pilot.Web.Tools.Numerator;

namespace Pilot.Web.Tools
{
    public static class NObjectExtensions
    {
        public static string GetTitle(this INObject obj, INType type)
        {
            if (type.IsProjectFileOrFolder())
            {
                DValue name;
                if (obj.Attributes.TryGetValue(SystemAttributes.PROJECT_ITEM_NAME, out name))
                    return name;
                return "unnamed";
            }
            return GetObjectTitle(obj, type);
        }

        public static bool IsEmpty(this INObject obj)
        {
            var emptyObject = new DObject { Id = obj.Id };
            return Comparer.AreEqual(emptyObject, obj);
        }

        private static IEnumerable<INAttribute> GetDisplayAttributes(this INType type)
        {
            return type.Attributes.Where(d => d.ShowInTree).OrderBy(d => d.DisplaySortOrder);
        }

        private static string GetObjectTitle(INObject obj, INType type)
        {
            if (type.Id == MType.SMART_FOLDER_ID && obj.Attributes.ContainsKey(SystemAttributes.SMART_FOLDER_TITLE))
            {
                return obj.Attributes[SystemAttributes.SMART_FOLDER_TITLE].ToString();
            }

            if (obj.Id == DObject.RootId)
                return type.Title;

            var sb = new StringBuilder();
            var attributes = AttributeFormatter.Format(type, obj.Attributes);

            foreach (var displayableAttr in type.GetDisplayAttributes())
            {
                var attributeText = GetAttributeText(obj, attributes, displayableAttr);
                if (sb.Length != 0 && !string.IsNullOrEmpty(attributeText))
                {
                    sb.Append(Constants.PROJECT_TITLE_ATTRIBUTES_DELIMITER);
                }
                sb.Append(attributeText);
            }
            return sb.ToString();
        }

        private static string GetAttributeText(INObject obj, IReadOnlyDictionary<string, DValue> attributes, INAttribute attr)
        {
            if (!attributes.TryGetValue(attr.Name, out var value))
                return string.Empty;

            switch (attr.Type)
            {
                case MAttrType.Numerator:
                    try
                    {
                        return GetNumeratorAttributeText(obj, attr, value.Value?.ToString());
                    }
                    catch (FormatException)
                    {
                        return string.Empty;
                    }
                case MAttrType.DateTime:
                    return GetDateTimeAttributeText(obj, value);
                default:
                    return value.Value?.ToString();
            }
        }

        public static string GetDateTimeAttributeText(INObject obj, DValue attributeValue)
        {
            //for backward compatibility - old datetime values were stored as strValue
            if (attributeValue.DateValue.HasValue)
            {
                return attributeValue.DateValue.Value.ToLocalTime().ToString(CultureInfo.CurrentCulture);
            }

            return attributeValue;
        }

        public static string GetNumeratorAttributeText(INObject obj, INAttribute attr, string attrValue)
        {
            if (string.IsNullOrEmpty(attrValue))
                return null;

            var description = attr.ParsedConfiguration().CounterDescriptions;
            var keywordProvider = new INumeratorKeywordProvider<INObject>[]
            {
                GetCurrentDateKeywordProviders(attrValue, description),
                new UnknownProvider(description.DraftText)
            };

            if (attrValue.StartsWith(NumeratorDescription.Deferred))
                attrValue = attrValue.Substring(NumeratorDescription.Deferred.Length);

            return new NumeratorFormatter<INObject>(new NumeratorKeywordProviderAggregator<INObject>(keywordProvider)).Format(obj, attrValue);
        }

        public static INumeratorKeywordProvider<INObject> GetCurrentDateKeywordProviders(string attributeValue, NCounterDescriptionList description)
        {
            var deferred = attributeValue.StartsWith(NumeratorDescription.Deferred) || description.DeferredRegistration;
            return new CurrentDateProvider(deferred);
        }
    }
}
