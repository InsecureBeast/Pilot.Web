using System;
using System.Collections.Generic;
using System.Linq;

namespace Pilot.Web.Model.Bim
{
    public class Tessellation
    {
        public Guid Id { get; set; }
        public ModelMesh ModelMesh { get; set; }
    }

    public class ModelMesh
    {
        public float[] Vertices { get; set; }
        public float[] Normals { get; set; }
        public uint[] Indices { get; set; }
        public uint[] EdgeIndices { get; set; }
        public uint Color { get; set; } = 0;
    }

    public class IfcNode
    {
        public Guid ParentGuid;
        public Guid ModelPartId;
        public Guid Guid { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Attributes { get; set; }
        public IfcNodeState ObjectState { get; set; } = IfcNodeState.Undefined;
        public Dictionary<Guid, List<MeshProperties>> MeshesProperties { get; set; }
    }

    public class MeshProperties
    {
        public uint meshColor; //r, b, g, a
        public float[] meshPlacement;

        public bool Equals(MeshProperties other)
        {
            return meshColor.Equals(other.meshColor)
                   && meshPlacement.SequenceEqual(other.meshPlacement);
        }

        public override bool Equals(object target)
        {
            return target is MeshProperties other && Equals(other);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = (int)meshColor * 397;

                if (meshPlacement != null)
                    hashCode = meshPlacement.Aggregate(hashCode, (current, x) => (current * 397) ^ x.GetHashCode());

                return hashCode;
            }
        }
    }

    [Flags]
    public enum IfcNodeState
    {
        Undefined = 0,
        Added = 1,
        Removed = 2,
        AttributesModified = 3,
        PlacementModified = 8,
        PlacementAndAttributesModified = AttributesModified | PlacementModified
    }
}
