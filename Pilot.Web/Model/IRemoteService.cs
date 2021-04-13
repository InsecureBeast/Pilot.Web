using System;
using Ascon.Pilot.Server.Api;
using Ascon.Pilot.Server.Api.Contracts;
using Pilot.Web.Model.ModifyData;

namespace Pilot.Web.Model
{
    public interface IRemoteService : IDisposable
    {
        IServerApiService GetServerApi();
        IFileArchiveApi GetFileArchiveApi();
        ISearchService GetSearchServiceApi();

        bool IsActive { get; }
    }

    class RemoteService : IRemoteService, IConnectionLostListener
    {
        private readonly HttpPilotClient _client;
        private readonly IServerApiService _serverApi;
        private readonly IFileArchiveApi _fileArchiveApi;
        private readonly ServerCallback _serverCallback;

        public RemoteService(HttpPilotClient client)
        {
            _client = client;
            _client.SetConnectionLostListener(this);
            _serverCallback = new ServerCallback();
            _fileArchiveApi = client.GetFileArchiveApi();

            var searchFactory = new SearchServiceFactory(_serverCallback);
            var localArchiveRootFolder = DirectoryProvider.GetTempPath();
            var fileStorageProvider = new FileStorageProvider(localArchiveRootFolder);
            var changsetUploader = new ChangesetUploader(_fileArchiveApi, fileStorageProvider, null);
            var messageApi = client.GetMessagesApi(new NullableMessagesCallback());
            var serverApi = client.GetServerApi(_serverCallback);
            var dbInfo = serverApi.OpenDatabase();
            var backend = new Backend(serverApi, dbInfo, messageApi, changsetUploader);

            _serverApi = new ServerApiService(serverApi, dbInfo, searchFactory, backend);
            _serverCallback.RegisterCallbackListener((IRemoteServiceListener) _serverApi);
            IsActive = true;
        }

        public ISearchService GetSearchServiceApi()
        {
            return _serverApi.GetSearchService();
        }

        public bool IsActive { get; private set; }

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
            IsActive = false;
        }
    }
}
