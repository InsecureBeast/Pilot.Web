using Ascon.Pilot.Server.Api.Contracts;

namespace Pilot.Web.Model
{
    public class ServerCommandRequestResult
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="data"></param>
        /// <param name="result"></param>
        public ServerCommandRequestResult(byte[] data, ServerCommandResult result)
        {
            Data = data;
            Result = result;
        }

        /// <summary>
        /// 
        /// </summary>
        public byte[] Data { get; }
        /// <summary>
        /// 
        /// </summary>
        public ServerCommandResult Result { get; }
    }
}