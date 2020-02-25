using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using Pilot.Web.Model.DataObjects;

namespace Pilot.Web.Tools
{
    public class ObjectComparer : IComparer<PObject>
    {
        public int Compare(PObject x, PObject y)
        {
            return DoCompare(x, y);
        }

        public int Compare(object x, object y)
        {
            var object1 = x as PObject;
            var object2 = y as PObject;
            return DoCompare(object1, object2);
        }

        private int DoCompare(PObject object1, PObject object2)
        {
            if (object1 == null && object2 == null)
                return 0;
            if (object1 == null)
                return -1;
            if (object2 == null)
                return 1;

            var result = object1.Type.Sort.CompareTo(object2.Type.Sort);
            if (result != 0)
                return result;

            result = ComparePropertyValues(1, object1, object2);
            return result;
        }

        public static int ComparePropertyValues(int direction, PObject x, PObject y)
        {
            //var result = NaturalComparer.Compare(x.Title, y.Title);
            return string.Compare(x.Title, y.Title, StringComparison.Ordinal);
        }
    }

    public class NaturalComparer : IComparer<string>
    {
        public static int Compare(string a, string b)
        {
            if (a == null && b == null)
                return 0;
            if (a == null)
                return -1;
            if (b == null)
                return 1;

            return StrCmpLogicalW(a, b);
        }

        int IComparer<string>.Compare(string x, string y)
        {
            return Compare(x, y);
        }

        [DllImport("shlwapi.dll", CharSet = CharSet.Unicode)]
        private static extern int StrCmpLogicalW(string psz1, string psz2);
    }
}
