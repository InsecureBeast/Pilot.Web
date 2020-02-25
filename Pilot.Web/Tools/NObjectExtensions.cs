using System;
using System.Collections.Generic;
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
            DValue value;
            attributes.TryGetValue(attr.Name, out value);
            var strValue = value?.Value?.ToString();
            if (attr.Type == MAttrType.Numerator)
            {
                try
                {
                    return GetNumeratorAttributeText(obj, strValue, attr.ParsedConfiguration().CounterDescriptions);
                }
                catch (FormatException)
                {
                    return string.Empty;
                }
            }
            return strValue;
        }

        public static string GetNumeratorAttributeText(INObject obj, string attributeValue, NCounterDescriptionList description)
        {
            if (string.IsNullOrEmpty(attributeValue))
                return null;

            bool deferred = false;
            string format = attributeValue;
            if (attributeValue.StartsWith(NumeratorDescription.Deferred))
            {
                deferred = true;
                format = attributeValue.Substring(NumeratorDescription.Deferred.Length);
            }
            if (description.DeferredRegistration)
            {
                deferred = true;
            }
            return new NumeratorFormatter(new NumeratorKeywordProviderAggregator(new INumeratorKeywordProvider[]
            {
                    new CurrentDateProvider(deferred),
                    new AttributeKeywordProvider(),
                    new UnknownProvider(description.DraftText)
            })).Format(obj, format);
        }
    }
}
