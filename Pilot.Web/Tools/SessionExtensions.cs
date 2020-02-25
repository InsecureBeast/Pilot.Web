using System.IO;
using Microsoft.AspNetCore.Http;

namespace Pilot.Web.Tools
{
    static class SessionExtensions
    {
        /// <summary>
        /// Set value of type <typeparam name="T">T</typeparam> at session dictionary using protobuf-net
        /// </summary>
        /// <typeparam name="T">type of value to set. Must be proto-serializable</typeparam>
        /// <param name="session">session to add values</param>
        /// <param name="key">key of value</param>
        /// <param name="value">value to set</param>
        public static void SetValue<T>(this ISession session, string key, T value)
        {
            using (var bs = new MemoryStream())
            {
                ProtoBuf.Serializer.Serialize(bs, value);
                session.Set(key, bs.ToArray());
            }
        }

        /// <summary>
        /// Deserialize values if type T from session dictionary using protobuf-net
        /// </summary>
        /// <typeparam name="T">type of value</typeparam>
        /// <param name="session">Session where values located</param>
        /// <param name="key">key of values in dictionary</param>
        /// <returns></returns>
        public static T GetValue<T>(this ISession session, string key)
        {
            var val = session.Get(key);
            if (val == null)
                return default(T);
            using (var bs = new MemoryStream(val))
            {
                return ProtoBuf.Serializer.Deserialize<T>(bs);
            }
        }
    }
}
