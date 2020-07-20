using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using ProtoBuf;

namespace Pilot.Web.Model.Bim
{
    public class Tessellation
    {
        public Guid Id { get; set; }
        public ModelMesh ModelMesh { get; set; }

        public bool Equals(Tessellation other)
        {
            return ModelMesh.Equals(other.ModelMesh);
        }

        public override bool Equals(object target)
        {
            return target is Tessellation other && Equals(other);
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
    }

    [ProtoContract]
    public class ModelMesh
    {
        [ProtoMember(1, IsPacked = true)]
        public float[] vertices;
        [ProtoMember(2, IsPacked = true)]
        public float[] normals;
        [ProtoMember(3, IsPacked = true)]
        public uint[] indices;
        [ProtoMember(4, IsPacked = true)]
        public uint[] edgeIndices;
        [ProtoMember(5, IsPacked = true)]
        public uint color = 0;

        public bool Equals(ModelMesh other)
        {
            return color.Equals(other.color)
                   && edgeIndices.SequenceEqual(other.edgeIndices)
                   && indices.SequenceEqual(other.indices)
                   && normals.SequenceEqual(other.normals)
                   && vertices.SequenceEqual(other.vertices);
        }

        public override bool Equals(object target)
        {
            return target is ModelMesh other && Equals(other);
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
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

    [ProtoContract]
    public class IfcNode
    {
        #region dependent properties
        public Guid Guid { get; set; }
        public Guid ModelPartId { get; set; }
        public IfcNodeState ObjectState { get; set; } = IfcNodeState.Undefined;
        public ElementPropertySet[] Attributes { get; set; }
        #endregion

        #region serialized properties
        [ProtoMember(1)]
        public Dictionary<Guid, List<MeshProperties>> MeshesProperties { get; set; }

        [ProtoMember(2, IsPacked = true)]
        public Guid ParentGuid { get; set; }

        [ProtoMember(3, IsPacked = true)]
        public string Name { get; set; }

        [ProtoMember(4, IsPacked = true)]
        public string Type { get; set; }
        #endregion

        public IfcNode WithId(Guid id)
        {
            Guid = id;
            return this;
        }

        public IfcNode WithModelPartId(Guid id)
        {
            ModelPartId = id;
            return this;
        }

        public IfcNode WithObjectState(IfcNodeState state)
        {
            ObjectState = state;
            return this;
        }
    }


    public struct IfcNodeId
    {
        public static IfcNodeId Empty => new IfcNodeId();

        public IfcNodeId(Guid nodeId, Guid modelPartId)
        {
            NodeId = nodeId;
            ModelPartId = modelPartId;
        }

        public Guid NodeId { get; }
        public Guid ModelPartId { get; }

        public static bool operator ==(IfcNodeId a, IfcNodeId b)
        {
            return a.Equals(b);
        }

        public static bool operator !=(IfcNodeId a, IfcNodeId b)
        {
            return !(a == b);
        }

        public bool Equals(IfcNodeId other)
        {
            return NodeId.Equals(other.NodeId) && ModelPartId.Equals(other.ModelPartId);
        }

        public override bool Equals(object obj)
        {
            return obj is IfcNodeId other && Equals(other);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return (NodeId.GetHashCode() * 397) ^ ModelPartId.GetHashCode();
            }
        }
    }

    public static class IfcNodeExtensions
    {
        public static IfcNodeId Id(this IfcNode node)
        {
            return new IfcNodeId(node.Guid, node.ModelPartId);
        }

        public static bool IsTransparent(this IfcNode node)
        {
            return node.MeshesProperties?.Any(dict => dict.Value.Any(meshProperties => (meshProperties.meshColor & 0x000000FF) != 255)) == true;
        }

        public static IfcNode WithObjectState(this IfcNode node, IfcNodeState state)
        {
            node.ObjectState = state;
            return node;
        }
    }

    [Serializable]
    public class ModelPartNodesVisibilityState
    {
        public Guid ModelPartId { get; set; }
        public List<Guid> HiddenNodesIds { get; set; }
        public List<Guid> VisibleChildrenNodesIds { get; set; }

        public ModelPartNodesVisibilityState()
        {
            HiddenNodesIds = new List<Guid>();
            VisibleChildrenNodesIds = new List<Guid>();
        }

        public ModelPartNodesVisibilityState(Guid modelPartId) : this()
        {
            ModelPartId = modelPartId;
        }

        public ModelPartNodesVisibilityState(Guid modelPartId, List<Guid> hiddenNodesIds, List<Guid> visibleChildrenNodesIds)
        {
            ModelPartId = modelPartId;
            HiddenNodesIds = hiddenNodesIds;
            VisibleChildrenNodesIds = visibleChildrenNodesIds;
        }
    }

    [ProtoContract]
    public class MeshProperties
    {
        [ProtoMember(1, IsPacked = true)]
        public uint meshColor; //r, b, g, a

        [ProtoMember(2, IsPacked = true)]
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

                if(meshPlacement != null)
                    hashCode = meshPlacement.Aggregate(hashCode, (current, x) => (current * 397) ^ x.GetHashCode());

                return hashCode;
            }
        }
    }

    public static class MeshExtensions
    {
        public static byte GetMeshColorAlpha(this MeshProperties properties)
        {
            return Convert.ToByte(properties.meshColor & 0x000000FF);
        }
    }

    public class Point2dim
    {
        public int x;
        public int y;
    }

    [Serializable]
    public class Point3dfm
    {
        public float x;
        public float y;
        public float z;

        public override string ToString()
        {
            return $"{x};{y};{z}";
        }

        public Point3dfm Addition(Point3dfm point)
        {
            return new Point3dfm()
            {
                x = this.x + point.x,
                y = this.y + point.y,
                z = this.z + point.z,
            };
        }
        public Point3dfm Subtraction(Point3dfm point)
        {
            return new Point3dfm()
            {
                x = this.x - point.x,
                y = this.y - point.y,
                z = this.z - point.z,
            };
        }
        public bool Equals(Point3dfm point)
        {
            return this.x.Equals(point.x) && this.y.Equals(point.y) && this.z.Equals(point.z);
        }
    }

    public class MousePosIntersect
    {
        public enum ObjectType
        {
            POINT = 1,
            MESH = 2,
            GIZMO = 3,
            CLIP_PLANE
        }

        public uint Id;
        public float Distance;
        public Point3dfm Coordinate;
        public Point3dfm Normal;
        public ObjectType Type;
    }

    public class NodeViewBox
    {
        public Point3dfm MinPoint, MaxPoint;
        public Point3dfm MidPoint => new Point3dfm() { x = (MinPoint.x + MaxPoint.x) / 2, y = (MinPoint.y + MaxPoint.y) / 2, z = (MinPoint.z + MaxPoint.z) / 2 };
    }

    public class MouseWheel
    {
        public int MouseX;
        public int MouseY;
        public int Delta;
    }

    [Serializable]
    public class CameraPosition
    {
        public double X;
        public double Y;
        public double Z;

        public double EyeX;
        public double EyeY;
        public double EyeZ;

        public double Angle;

        public override string ToString()
        {
            return $"{X:######.###}/{Y:######.###}/{Z:######.###}   {EyeX:######.###}/{EyeY:######.###}/{EyeZ:######.###}    {Angle:######.###}";
        }

        public override bool Equals(object obj)
        {
            return obj is CameraPosition other && other.ToString() == ToString();
        }

        public override int GetHashCode()
        {
            return ToString().GetHashCode();
        }
    }

    [Serializable]
    public class ClipPlane
    {
        public float X;
        public float Y;
        public float Z;

        public float NormalX;
        public float NormalY;
        public float NormalZ;

        public override string ToString()
        {
            return $"{X:######.###}/{Y:######.###}/{Z:######.###}   {NormalX:######.###}/{NormalY:######.###}/{NormalZ:######.###}";
        }

        public override bool Equals(object obj)
        {
            return obj is ClipPlane other && other.ToString() == ToString();
        }

        public override int GetHashCode()
        {
            return ToString().GetHashCode();
        }
    }

    [Serializable]
    public class RenderOptions
    {
        public bool AmbientOcclusion { get; set; } = true;
        public bool Light { get; set; } = true;
        public bool LineAntiAliasing { get; set; } = true;
        public bool MultisampleAntiAliasing { get; set; } = false;
        public bool Edges { get; set; } = true;
        public bool Axes { get; set; } = true;
        public bool Fps { get; set; } = false;
        public bool HiddenSmallObjects { get; set; } = false;
        public bool HiddenSmallObjectsWithMouseNavigation { get; set; } = false;
        public bool HiddenEdgesWithMouseNavigation { get; set; } = false;
        public bool BBoxInsteadOfSmallObjects { get; set; } = false;
        public int SmallObjectSize { get; set; } = 10; // 10 pixels by default
    }

    [Serializable]
    public class MeshSimplificationParams
    {
        public bool Enabled { get; set; }
        public string Mode { get; set; } // all or canonic_only
        public bool UseRelativeTolerance { get; set; }
        public double Tolerance { get; set; }
        public IReadOnlyList<IfcType> IfcClasses { get; set; }
        public bool SaveMeshes { get; set; }

        public MeshSimplificationParams()
        {
            Enabled = false;
            UseRelativeTolerance = true;
            Tolerance = 0.005;
            Mode = "all";
            IfcClasses = new List<IfcType>();
            SaveMeshes = false;
        }
    }

    [Serializable]
    public class BarSimplificationParams
    {
        public bool Enabled { get; set; }
        public double Diameter { get; set; }
        public IReadOnlyList<IfcType> IfcClasses { get; set; }

        public BarSimplificationParams()
        {
            Enabled = false;
            IfcClasses = new List<IfcType>();
        }
    }

    [ProtoContract]
    public class ElementPropertySet
    {
        [ProtoMember(1, IsPacked = true)]
        public string Name { get; set; }

        [ProtoMember(2)]
        public ElementProperty[] Properties { get; set; }

        #region Comparable
        public bool Equals(ElementPropertySet other)
        {
            return Name.Equals(other.Name)
                   && Properties.SequenceEqual(other.Properties);
        }

        public override bool Equals(object target)
        {
            return target is ElementPropertySet other && Equals(other);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = (Name != null ? Name.GetHashCode() : 0) * 397;

                if (Properties != null)
                    hashCode = Properties.Aggregate(hashCode, (current, x) => (current * 397) ^ x.GetHashCode());

                return hashCode;
            }
        }



        #endregion
    }

    [ProtoContract]
    public class ElementProperty : IEquatable<ElementProperty>
    {
        [ProtoMember(1, IsPacked = true)]
        public string Name { get; set; }

        [ProtoMember(2, IsPacked = true)]
        public short Unit { get; set; }

        [ProtoMember(3)] 
        public DValue Value { get; set; }

        #region Comparable
        public bool Equals(ElementProperty other)
        {
            return other != null && (Name.Equals(other.Name) 
                                     && Unit.Equals(other.Unit) 
                                     && Value.Equals(other.Value));
        }

        public override bool Equals(object target)
        {
            return target is ElementProperty other && Equals(other);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = (Name != null ? Name.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ Unit.GetHashCode();
                hashCode = (hashCode * 397) ^ (Value != null ? Value.GetHashCode() : 0);
                return hashCode;
            }
        }

        public static bool operator ==(ElementProperty left, ElementProperty right)
        {
            return Equals(left, right);
        }

        public static bool operator !=(ElementProperty left, ElementProperty right)
        {
            return !Equals(left, right);
        }

        #endregion
    }

    [ProtoContract]
    public class DValue : IEquatable<string>, IEquatable<long>, IEquatable<int>, IEquatable<double>, IEquatable<DateTime>, IEquatable<decimal>, IEquatable<Guid>
    {
        public object Value { get; set; }

        [ProtoMember(1)]
        public string StrValue
        {
            get => Value as string;
            set => Value = value;
        }

        [ProtoMember(2)]
        public long? IntValue
        {
            get => Value as long?;
            set => Value = value;
        }

        [ProtoMember(3)]
        public double? DoubleValue
        {
            get => Value as double?;
            set => Value = value;
        }

        [ProtoMember(4)]
        public DateTime? DateValue
        {
            get => Value as DateTime?;
            set => Value = value;
        }

        [ProtoMember(5)]
        public string[] ArrayValue
        {
            get => Value as string[];
            set => Value = value;
        }

        [ProtoMember(6)]
        public decimal? DecimalValue
        {
            get => Value as decimal?;
            set => Value = value;
        }

        [ProtoMember(7)]
        public Guid? GuidValue
        {
            get => Value as Guid?;
            set => Value = value;
        }

        [ProtoMember(8)]
        public int[] ArrayIntValue
        {
            get => Value as int[];
            set => Value = value;
        }

        public override int GetHashCode()
        {
            if (Value == null)
                return 0;
            return Value.GetHashCode();
        }

        public override bool Equals(object other)
        {
            if (ReferenceEquals(this, other))
                return true;
            if (other is DValue value)
                return Equals(value);
            return Equals(Value, other);
        }

        public bool Equals(DValue other)
        {
            if (ReferenceEquals(this, other))
                return true;
            if (other == null)
                return false;

            if (ArrayIntValue != null && other.ArrayIntValue != null)
            {
                return ArrayIntValue.SequenceEqual(other.ArrayIntValue);
            }

            if (ArrayValue != null && other.ArrayValue != null)
            {
                return ArrayValue.SequenceEqual(other.ArrayValue);
            }

            return Equals(Value, other.Value);
        }

        public static implicit operator DValue(long value)
        {
            return new DValue { Value = value };
        }

        public static implicit operator DValue(double value)
        {
            return new DValue { Value = value };
        }

        public static implicit operator DValue(string value)
        {
            return new DValue { Value = value };
        }

        public static implicit operator DValue(string[] value)
        {
            return new DValue { Value = value };
        }

        public static implicit operator DValue(int[] value)
        {
            return new DValue { Value = value };
        }

        public static implicit operator DValue(DateTime value)
        {
            return new DValue { Value = value };
        }

        public static implicit operator DValue(decimal value)
        {
            return new DValue { Value = value };
        }

        public static implicit operator DValue(Guid value)
        {
            return new DValue { Value = value };
        }

        public static implicit operator long(DValue value)
        {
            return (long)value.Value;
        }

        public static implicit operator double(DValue value)
        {
            return (double)value.Value;
        }

        public static implicit operator string(DValue value)
        {
            return (string)value?.Value;
        }

        public static implicit operator string[](DValue value)
        {
            return (string[])value?.Value;
        }

        public static implicit operator int[](DValue value)
        {
            return (int[])value?.Value;
        }

        public static implicit operator DateTime(DValue value)
        {
            return (DateTime)value.Value;
        }

        public static implicit operator decimal(DValue value)
        {
            return (decimal)value.Value;
        }

        public static implicit operator Guid(DValue value)
        {
            return (Guid)value.Value;
        }

        public bool IsArray => Value != null && Value.GetType().IsArray;

        public DValue Clone()
        {
            return new DValue { Value = Value };
        }

        public bool Equals(string other) => Value.Equals(other);
        public bool Equals(int other) => Value.Equals((long)other);
        public bool Equals(long other) => Value.Equals(other);
        public bool Equals(double other) => Value.Equals(other);
        public bool Equals(decimal other) => Value.Equals(other);
        public bool Equals(DateTime other) => Value.Equals(other);
        public bool Equals(Guid other) => Value.Equals(other);

        public override string ToString()
        {
            if (StrValue != null)
                return StrValue;
            if (IntValue != null)
                return IntValue.ToString();
            if (DoubleValue != null)
                return DoubleValue.ToString();
            if (DateValue != null)
                return DateValue.Value.ToShortDateString();
            if (DecimalValue != null)
                return DecimalValue.Value.ToString(CultureInfo.InvariantCulture);
            if (ArrayValue != null)
                return string.Join(", ", ArrayValue);
            if (ArrayIntValue != null)
                return string.Join(", ", ArrayIntValue);
            if (GuidValue != null)
                return GuidValue.Value.ToString();
            return string.Empty;
        }

        public static DValue GetDValue(object value)
        {
            if (value == null)
                return new DValue();
            if (value is int)
                return (int)value;
            if (value is long)
                return (long)value;
            if (value is double)
                return (double)value;
            if (value is string)
                return (string)value;
            if (value is DateTime)
                return (DateTime)value;
            if (value is decimal)
                return (decimal)value;
            if (value is string[])
                return (string[])value;
            if (value is int[])
                return (int[])value;
            if (value is Guid)
                return (Guid)value;

            throw new Exception($"Error converting attribute value [{value}] to DValue");
        }
    }
    
    public enum UnitPrefix : short
    {
        ENUM_NONE,
        ENUM_EXA,
        ENUM_PETA,
        ENUM_TERA,
        ENUM_GIGA,
        ENUM_MEGA,
        ENUM_KILO,
        ENUM_HECTO,
        ENUM_DECA,
        ENUM_DECI,
        ENUM_CENTI,
        ENUM_MILLI,
        ENUM_MICRO,
        ENUM_NANO,
        ENUM_PICO,
        ENUM_FEMTO,
        ENUM_ATTO
    };

    public enum Unit : short
    {
        ENUM_AMPERE,
        ENUM_BECQUEREL,
        ENUM_CANDELA,
        ENUM_COULOMB,
        ENUM_CUBIC_METRE,
        ENUM_DEGREE_CELSIUS,
        ENUM_FARAD,
        ENUM_GRAM,
        ENUM_GRAY,
        ENUM_HENRY,
        ENUM_HERTZ,
        ENUM_JOULE,
        ENUM_KELVIN,
        ENUM_LUMEN,
        ENUM_LUX,
        ENUM_METRE,
        ENUM_MOLE,
        ENUM_NEWTON,
        ENUM_OHM,
        ENUM_PASCAL,
        ENUM_RADIAN,
        ENUM_SECOND,
        ENUM_SIEMENS,
        ENUM_SIEVERT,
        ENUM_SQUARE_METRE,
        ENUM_STERADIAN,
        ENUM_TESLA,
        ENUM_VOLT,
        ENUM_WATT,
        ENUM_WEBER,
        ENUM_ANGULARVELOCITY,
        ENUM_AREADENSITY,
        ENUM_COMPOUNDPLANEANGLE,
        ENUM_DYNAMICVISCOSITY,
        ENUM_HEATFLUXDENSITY,
        ENUM_INTEGERCOUNTRATE,
        ENUM_ISOTHERMALMOISTURECAPACITY,
        ENUM_KINEMATICVISCOSITY,
        ENUM_LINEARVELOCITY,
        ENUM_MASSDENSITY,
        ENUM_MASSFLOWRATE,
        ENUM_MOISTUREDIFFUSIVITY,
        ENUM_MOLECULARWEIGHT,
        ENUM_SPECIFICHEATCAPACITY,
        ENUM_THERMALADMITTANCE,
        ENUM_THERMALCONDUCTANCE,
        ENUM_THERMALRESISTANCE,
        ENUM_THERMALTRANSMITTANCE,
        ENUM_VAPORPERMEABILITY,
        ENUM_VOLUMETRICFLOWRATE,
        ENUM_ROTATIONALFREQUENCY,
        ENUM_TORQUE,
        ENUM_MOMENTOFINERTIA,
        ENUM_LINEARMOMENT,
        ENUM_LINEARFORCE,
        ENUM_PLANARFORCE,
        ENUM_MODULUSOFELASTICITY,
        ENUM_SHEARMODULUS,
        ENUM_LINEARSTIFFNESS,
        ENUM_ROTATIONALSTIFFNESS,
        ENUM_MODULUSOFSUBGRADEREACTION,
        ENUM_ACCELERATION,
        ENUM_CURVATURE,
        ENUM_HEATINGVALUE,
        ENUM_IONCONCENTRATION,
        ENUM_LUMINOUSINTENSITYDISTRIBUTION,
        ENUM_MASSPERLENGTH,
        ENUM_MODULUSOFLINEARSUBGRADEREACTION,
        ENUM_MODULUSOFROTATIONALSUBGRADEREACTION,
        ENUM_PH,
        ENUM_ROTATIONALMASS,
        ENUM_SECTIONAREAINTEGRAL,
        ENUM_SECTIONMODULUS,
        ENUM_SOUNDPOWERLEVEL,
        ENUM_SOUNDPOWER,
        ENUM_SOUNDPRESSURELEVEL,
        ENUM_SOUNDPRESSURE,
        ENUM_TEMPERATUREGRADIENT,
        ENUM_TEMPERATURERATEOFCHANGE,
        ENUM_THERMALEXPANSIONCOEFFICIENT,
        ENUM_WARPINGCONSTANT,
        ENUM_WARPINGMOMENT,
        ENUM_USERDEFINED
    };
}
