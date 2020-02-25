using System;
using Ascon.Pilot.Server.Api;
using Ascon.Pilot.Server.Api.Contracts;

namespace Pilot.Web.Model
{
    public interface IRemoteService : IDisposable
    {
        IServerApiService GetServerApi();
        IFileArchiveApi GetFileArchiveApi();

        bool IsActive { get; }
    }

    class RemoteService : IRemoteService, IConnectionLostListener
    {
        private readonly HttpPilotClient _client;
        private readonly IServerApiService _serverApi;
        private readonly IFileArchiveApi _fileArchiveApi;
        private bool _isActive = false;
        private readonly ServerCallback _serverCallback;

        public RemoteService(HttpPilotClient client)
        {
            _client = client;
            _client.SetConnectionLostListener(this);
            _serverCallback = new ServerCallback();

            var serverApi = client.GetServerApi(_serverCallback);
            var dbInfo = serverApi.OpenDatabase();
            var searchFactory = new SearchServiceFactory(_serverCallback);
            _serverApi = new ServerApiService(serverApi, dbInfo, searchFactory);
            _serverCallback.RegisterCallbackListener((IRemoteServiceListener) _serverApi);
            _fileArchiveApi = client.GetFileArchiveApi();

            _isActive = true;
        }

        public bool IsActive => _isActive;

        public IServerApiService GetServerApi()
        {
            return _serverApi;
        }

        public IFileArchiveApi GetFileArchiveApi()
        {
            return _fileArchiveApi;
        }

        public void Dispose()
        {
            _client.Disconnect();
            _client?.Dispose();
        }

        public void ConnectionLost(Exception ex = null)
        {
            _isActive = false;
        }
    }
}
