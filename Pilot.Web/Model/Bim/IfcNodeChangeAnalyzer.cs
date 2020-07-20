using System;
using System.Collections.Generic;
using System.Linq;

namespace Pilot.Web.Model.Bim
{
    public static class IfcNodeChangeAnalyzer
    {
        //TODO true = something changed, false = the same
        public static bool Compare(Dictionary<Guid, List<MeshProperties>> first, 
            Dictionary<Guid, List<MeshProperties>> second, 
            Dictionary<Guid,Tessellation> contextTessellations)
        {
            if (CompareMeshProperties(first, second, contextTessellations))
                return true;

            return false;
        }

        ////TODO true = something changed, false = the same
        //public static bool Compare(IfcNode first, IfcNode second)
        //{
        //    var attrsChanged = ProcessAttributes(first.Attributes, second.Attributes);
        //    var meshPropertiesChanged = CompareMeshProperties(first.MeshesProperties, second.MeshesProperties);

        //    return attrsChanged || meshPropertiesChanged;
        //}

        private static bool ProcessAttributes(string first, string second)
        {
            return first != second;
        }

        private static bool CompareMeshProperties(Dictionary<Guid, List<MeshProperties>> first, 
            Dictionary<Guid, List<MeshProperties>> second, 
            IReadOnlyDictionary<Guid, Tessellation> contextTessellations)
        {
            if (first == null || second == null)
                return false;

            if (first.Count != second.Count)
                return true;

            for (var i = 0; i < first.Count; i++)
            {
                var firstValue = first.ElementAt(i);
                var secondValue = second.ElementAt(i);

                if (!firstValue.Value.SequenceEqual(secondValue.Value))
                {
                    return true;
                }

                if (contextTessellations.TryGetValue(firstValue.Key, out var firstTessellation) 
                    && contextTessellations.TryGetValue(secondValue.Key, out var secondTessellation))
                {
                    if (!firstTessellation.Equals(secondTessellation))
                        return true;
                }
            }

            return false;
        }
    }
}
