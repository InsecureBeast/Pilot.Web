using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using Pilot.Web.Model.Auth;

namespace Pilot.Web.Model
{
    public interface IContextService
    {
        IServerApiService GetServerApi(string actor);
        IFileLoader GetFileLoader(string actor);

        void CreateContext(Credentials credentials);
        void RemoveContext(string actor);
    }

    class ContextService : IContextService
    {
        private readonly IConnectionService _connectionService;
        private readonly ConcurrentDictionary<string, IRemoteService> _services = new ConcurrentDictionary<string, IRemoteService>();
        
        public ContextService(IConnectionService connectionService)
        {
            _connectionService = connectionService;
        }

        public IServerApiService GetServerApi(string actor)
        {
            var apiService = GetRemoteService(actor);
            return apiService.GetServerApi();
        }

        public IFileLoader GetFileLoader(string key)
        {
            var apiService = GetRemoteService(key);
            var fileArchiveApi = apiService.GetFileArchiveApi();
            return new FileLoader(fileArchiveApi);
        }

        public void CreateContext(Credentials credentials)
        {
            var httpClient = _connectionService.Connect(credentials);
            var apiService = new RemoteService(httpClient);
            _services[credentials.Username] = apiService;
        }

        public void RemoveContext(string actor)
        {
            if (_services.Remove(actor, out var remoteService))
                remoteService.Dispose();
        }

        private IRemoteService GetRemoteService(string actor)
        {
            _services.TryGetValue(actor, out var apiService);
            if (apiService == null)
                throw new UnauthorizedAccessException();

            if (!apiService.IsActive)
            {
                throw new UnauthorizedAccessException();

                //RemoveContext(actor);
                //CreateContext(actor);
            }

            return apiService;
        }
    }
}
