using System.Collections.Generic;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Model.ModifyData
{
    public class Change
    {
        public Change()
        {
            Attributes = new ChangesResult<AttributeChangeValue>();
        }

        public string ObjectId { get; set; }
        public ChangesResult<AttributeChangeValue> Attributes { get; set; }
    }

    public class ChangesResult<T>
    {
        public ChangesResult()
        {
            Removed = new List<T>();
            Changed = new List<T>();
        }

        public IList<T> Removed { get; set; }
        public IList<T> Changed { get; set; }
    }

    public class AttributeChangeValue
    {
        public string Name { get; set; }
        public string Value { get; set; }
    }
}
