//using System;
//using System.Collections.Generic;
//using System.Runtime.CompilerServices;

//namespace Pilot.Web.Model.Bim
//{
//    public static class ModelMeshSerializer
//    {
//        //public static byte[] Serialize(ModelMesh mesh)
//        //{
//        //    int pos = 0;
//        //    var bytes = new byte[MeasureSerializationLength(mesh)];
//        //    SerializerUtils.WriteFloatArray(bytes, mesh.Vertices, ref pos);
//        //    SerializerUtils.WriteFloatArray(bytes, mesh.Normals, ref pos);
//        //    SerializerUtils.WriteUintArray(bytes, mesh.Indices, ref pos);
//        //    SerializerUtils.WriteUintArray(bytes, mesh.EdgeIndices, ref pos);
//        //    SerializerUtils.WriteUint(bytes, mesh.Color, ref pos);
//        //    return bytes;
//        //}

//        //public static ModelMesh Deserialize(byte[] bytes)
//        //{
//        //    int pos = 0;
//        //    return new ModelMesh
//        //    {
//        //        Vertices = SerializerUtils.ReadFloatArray(bytes, ref pos),
//        //        Normals = SerializerUtils.ReadFloatArray(bytes, ref pos),
//        //        Indices = SerializerUtils.ReadUintArray(bytes, ref pos),
//        //        EdgeIndices = SerializerUtils.ReadUintArray(bytes, ref pos),
//        //        Color = SerializerUtils.ReadUint(bytes, ref pos)
//        //    };
//        //}

//        //private static int MeasureSerializationLength(ModelMesh mesh)
//        //{
//        //    return sizeof(int) +
//        //           mesh.Vertices.Length * sizeof(float) +

//        //           sizeof(int) +
//        //           mesh.Normals.Length * sizeof(float) +

//        //           sizeof(int) +
//        //           mesh.Indices.Length * sizeof(uint) +

//        //           sizeof(int) +
//        //           mesh.EdgeIndices.Length * sizeof(uint) +

//        //           sizeof(uint);
//        //}
//    }

//    internal static class SerializerUtils
//    {
//        [MethodImpl(MethodImplOptions.AggressiveInlining)]
//        public static float[] ReadFloatArray(byte[] bytes, ref int pos)
//        {
//            return ReadArray<float>(bytes, sizeof(float), ref pos);
//        }

//        [MethodImpl(MethodImplOptions.AggressiveInlining)]
//        public static uint[] ReadUintArray(byte[] bytes, ref int pos)
//        {
//            return ReadArray<uint>(bytes, sizeof(uint), ref pos);
//        }

//        [MethodImpl(MethodImplOptions.AggressiveInlining)]
//        public static void WriteFloatArray(byte[] destination, float[] array, ref int pos)
//        {
//            WriteArray(destination, array, sizeof(float), ref pos);
//        }

//        [MethodImpl(MethodImplOptions.AggressiveInlining)]
//        public static void WriteUintArray(byte[] destination, uint[] array, ref int pos)
//        {
//            WriteArray(destination, array, sizeof(uint), ref pos);
//        }

//        [MethodImpl(MethodImplOptions.AggressiveInlining)]
//        private static T[] ReadArray<T>(byte[] bytes, int structSize, ref int pos)
//        {
//            int length = ReadInt(bytes, ref pos);
//            var result = new T[length];
//            var bytesLength = length * structSize;
//            Buffer.BlockCopy(bytes, pos, result, 0, bytesLength);
//            pos += bytesLength;
//            return result;
//        }

//        [MethodImpl(MethodImplOptions.AggressiveInlining)]
//        public static int ReadInt(byte[] bytes, ref int pos)
//        {
//            int value = BitConverter.ToInt32(bytes, pos);
//            pos += sizeof(int);
//            return value;
//        }

//        [MethodImpl(MethodImplOptions.AggressiveInlining)]
//        private static void WriteArray<T>(byte[] destination, T[] array, int structSize, ref int pos)
//        {
//            WriteInt(destination, array.Length, ref pos);
//            var length = array.Length * structSize;
//            Buffer.BlockCopy(array, 0, destination, pos, length);
//            pos += length;
//        }

//        [MethodImpl(MethodImplOptions.AggressiveInlining)]
//        public static void WriteInt(byte[] destination, int value, ref int pos)
//        {
//            destination[pos++] = (byte)value;
//            destination[pos++] = (byte)(value >> 8);
//            destination[pos++] = (byte)(value >> 16);
//            destination[pos++] = (byte)(value >> 24);
//        }

//        [MethodImpl(MethodImplOptions.AggressiveInlining)]
//        public static void WriteUint(byte[] destination, uint value, ref int pos)
//        {
//            destination[pos++] = (byte)value;
//            destination[pos++] = (byte)(value >> 8);
//            destination[pos++] = (byte)(value >> 16);
//            destination[pos++] = (byte)(value >> 24);
//        }

//        [MethodImpl(MethodImplOptions.AggressiveInlining)]
//        public static uint ReadUint(byte[] bytes, ref int pos)
//        {
//            var value = BitConverter.ToUInt32(bytes, pos);
//            pos += sizeof(uint);
//            return value;
//        }

//        [MethodImpl(MethodImplOptions.AggressiveInlining)]
//        public static void WriteGuid(byte[] destination, Guid value, ref int pos)
//        {
//            var bytes = value.ToByteArray();
//            Buffer.BlockCopy(bytes, 0, destination, pos, bytes.Length);
//            pos += bytes.Length;
//        }

//        [MethodImpl(MethodImplOptions.AggressiveInlining)]
//        public static Guid ReadGuid(byte[] bytes, ref int pos)
//        {
//            var a = bytes[pos + 3] << 24 | bytes[pos + 2] << 16 | bytes[pos + 1] << 8 | bytes[pos];
//            var b = (short)(bytes[pos + 5] << 8 | bytes[pos + 4]);
//            var c = (short)(bytes[pos + 7] << 8 | bytes[pos + 6]);
//            var result = new Guid(a, b, c, bytes[pos + 8], bytes[pos + 9], bytes[pos + 10], bytes[pos + 11], bytes[pos + 12], bytes[pos + 13], bytes[pos + 14], bytes[pos + 15]);
//            pos += 16;
//            return result;
//        }
//    }

//    public static class MeshPropertiesSerializer
//    {
//        public static byte[] Serialize(Dictionary<Guid, List<MeshProperties>> properties)
//        {
//            if (properties == null)
//                return null;

//            int pos = 0;
//            var bytes = new byte[MeasureSerializationLength(properties)];
//            SerializerUtils.WriteInt(bytes, properties.Count, ref pos);
//            foreach (var pair in properties)
//            {
//                SerializerUtils.WriteGuid(bytes, pair.Key, ref pos);
//                SerializerUtils.WriteInt(bytes, pair.Value.Count, ref pos);
//                foreach (var props in pair.Value)
//                {
//                    SerializerUtils.WriteUint(bytes, props.meshColor, ref pos);
//                    SerializerUtils.WriteFloatArray(bytes, props.meshPlacement, ref pos);
//                }
//            }
//            return bytes;
//        }

//        public static Dictionary<Guid, List<MeshProperties>> Deserialize(byte[] bytes)
//        {
//            if (bytes == null)
//                return new Dictionary<Guid, List<MeshProperties>>();

//            int pos = 0;
//            var length = SerializerUtils.ReadInt(bytes, ref pos);
//            var result = new Dictionary<Guid, List<MeshProperties>>(length);
//            for (int i = 0; i < length; i++)
//            {
//                var id = SerializerUtils.ReadGuid(bytes, ref pos);
//                var size = SerializerUtils.ReadInt(bytes, ref pos);
//                var list = new List<MeshProperties>(size);
//                for (int j = 0; j < size; j++)
//                {
//                    var prop = new MeshProperties
//                    {
//                        meshColor = SerializerUtils.ReadUint(bytes, ref pos),
//                        meshPlacement = SerializerUtils.ReadFloatArray(bytes, ref pos)
//                    };
//                    list.Add(prop);
//                }
//                result[id] = list;
//            }
//            return result;
//        }

//        private static int MeasureSerializationLength(Dictionary<Guid, List<MeshProperties>> value)
//        {
//            // Dictionary size
//            int result = sizeof(int);
//            foreach (var pair in value)
//            {
//                // Guid
//                result += 16;
//                // List size
//                result += sizeof(int);
//                // List values
//                foreach (var props in pair.Value)
//                {
//                    // uint meshColor
//                    result += sizeof(uint);
//                    // float[] meshPlacement length
//                    result += sizeof(int);
//                    // float[] values
//                    result += sizeof(float) * props.meshPlacement.Length;
//                }
//            }
//            return result;
//        }
//    }
//}
