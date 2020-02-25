using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search
{
    class PresetItem : IPresetItem
    {
        public PresetItem(string id, string displayValue, string data = null, string hint = null, bool isVisible = true, bool isDeleted = false)
        {
            Id = id;
            DisplayValue = displayValue;
            Data = data;
            Hint = hint;
            IsVisible = isVisible;
            IsDeleted = isDeleted;
        }

        public string Id { get; }
        public string DisplayValue { get; }
        public string Data { get; }
        public string Hint { get; }
        public bool IsVisible { get; }
        public string Tooltip { get; set; }
        public int Sort { get; set; } = Int32.MaxValue;

        public bool IsDeleted { get; }

        public override string ToString()
        {
            return DisplayValue;
        }

        public override int GetHashCode()
        {
            var concationation = $"{Id}{DisplayValue}{Data}{Hint}";
            return !string.IsNullOrEmpty(concationation) ? concationation.GetHashCode() : 0;
        }

        public override bool Equals(object obj)
        {
            var other = obj as PresetItem;
            return other != null
                   && Id == other.Id
                   && DisplayValue == other.DisplayValue
                   && Data == other.Data
                   && Hint == other.Hint
                   && IsVisible == other.IsVisible
                   && IsDeleted == other.IsDeleted
                   && Sort == other.Sort;
        }
    }

    class KeywordPresetItem : PresetItem
    {
        public KeywordPresetItem(string displayValue, string hint) : base(displayValue, displayValue, hint)
        {
        }

        public KeywordPresetItem(IKeywordToken token) : base(token.Alias, token.Alias, token.Hint)
        {
        }
    }
}
