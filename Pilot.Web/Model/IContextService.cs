using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Pilot.Web.Model.Auth;
using Pilot.Web.Tools;

namespace Pilot.Web.Model
{
    public interface IContextService
    {
        IServerApiService GetServerApi(string actor);
        IFileLoader GetFileLoader(string actor);
        ISearchService GetSearchService(string actor);

        void CreateContext(Credentials credentials);
        void RemoveContext(string actor);

        string GetTokenActor(HttpContext httpContext);
    }

    class ContextService : IContextService
    {
        private readonly IConnectionService _connectionService;
        private readonly IRemoteServiceFactory _remoteServiceFactory;
        private readonly ConcurrentDictionary<string, IRemoteService> _services = new ConcurrentDictionary<string, IRemoteService>();
        
        public ContextService(IConnectionService connectionService, IRemoteServiceFactory remoteServiceFactory)
        {
            _connectionService = connectionService;
            _remoteServiceFactory = remoteServiceFactory;
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

        public ISearchService GetSearchService(string actor)
        {
            var apiService = GetRemoteService(actor);
            return apiService.GetSearchServiceApi();
        }

        public void CreateContext(Credentials credentials)
        {
            lock (_services)
            {
                if (_services.ContainsKey(credentials.Username))
                    return;

                var httpClient = _connectionService.Connect(credentials);
                var apiService = _remoteServiceFactory.CreateRemoteService(httpClient);
                _services[credentials.Username] = apiService;
            }
        }

        public void RemoveContext(string actor)
        {
            lock (_services)
            {
                if (_services.Remove(actor, out var remoteService))
                    remoteService.Dispose();
            }
        }

        public string GetTokenActor(HttpContext httpContext)
        {
            return httpContext.GetTokenActor();
        }

        private IRemoteService GetRemoteService(string actor)
        {
            lock (_services)
            {
                _services.TryGetValue(actor, out var apiService);

                if (apiService == null)
                    throw new UnauthorizedAccessException();

                if (!apiService.IsActive)
                {
                    throw new UnauthorizedAccessException();
                }

                return apiService;
            }
        }
    }
}
