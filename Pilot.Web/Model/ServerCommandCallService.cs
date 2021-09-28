using System;
using Ascon.Pilot.Server.Api.Contracts;
using Ascon.Pilot.Transport;

namespace Pilot.Web.Model
{
    public class ServerCommandCallService<T> : ICallService
    {
        private readonly IServerApiService _serverApiService;
        private readonly string _commandName;
        
        public ServerCommandCallService(IServerApiService serverApiService, string processorName = null)
        {
            _serverApiService = serverApiService;
            _commandName = CommandNameParser.GetCommandName(typeof(T).Name, processorName);
        }

        public byte[] Call(byte[] data)
        {
            var result = _serverApiService.InvokeServerCommand(_commandName, data)
                .GetAwaiter()
                .GetResult();

            switch (result.Result)
            {
                case ServerCommandResult.Success:
                    return result.Data;
                case ServerCommandResult.Error:
                    throw TransportClient.ReadException(result.Data);
                default:
                    throw new InvalidOperationException("Unable to deserialize server command response");
            }
        }
    }
}
