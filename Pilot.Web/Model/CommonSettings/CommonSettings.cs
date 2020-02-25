using System.Collections.Generic;
using System.Linq;

namespace Pilot.Web.Model.CommonSettings
{
    public class CommonSettings : ICommonSettings
    {
        public static readonly ICommonSettings Null = new CommonSettings();

        public CommonSettings()
        {
            Common = new List<string>();
        }

        public string Personal { get; set; }
        public List<string> Common { get; }

        IReadOnlyCollection<string> ICommonSettings.Common => Common;

        protected bool Equals(CommonSettings other)
        {
            return string.Equals(Personal, other.Personal) && Common.SequenceEqual(other.Common);
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((CommonSettings)obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = (Personal != null ? Personal.GetHashCode() : 0);
                foreach (var str in Common)
                {
                    hashCode = (hashCode * 397) ^ (str != null ? str.GetHashCode() : 0);
                }
                return hashCode;
            }
        }
    }
}
