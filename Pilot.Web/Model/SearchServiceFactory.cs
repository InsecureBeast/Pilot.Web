using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ascon.Pilot.DataClasses;
using log4net;
using Pilot.Web.Model.Search;
using Pilot.Web.Model.Search.NextTasksSearchExpression;
using Pilot.Web.Model.Search.NextTasksSearchExpression.Tokens;

namespace Pilot.Web.Model
{
    public interface ISearchServiceFactory
    {
        ISearchService GetSearchService(IServerApiService apiService, INPerson person, IReadOnlyDictionary<int, INType> types);
    }

    public interface ISearchService
    {
        Task<DSearchResult> Search(string filter);
        Task<DSearchResult> SearchObjectWithFilter(string filter, Guid id);
    }

    class SearchServiceFactory : ISearchServiceFactory
    {
        private readonly ServerCallback _callback;

        public SearchServiceFactory(ServerCallback callback)
        {
            _callback = callback;
        }
        
        public ISearchService GetSearchService(IServerApiService apiService, INPerson person, IReadOnlyDictionary<int, INType> types)
        {
            return new SearchService(apiService, _callback, person, types);
        }
    }

    class SearchService : ISearchService, IRemoteSearchServiceListener
    {
        private readonly ILog _logger = LogManager.GetLogger(typeof(SearchService));
        private readonly IServerApiService _apiService;
        private readonly INPerson _person;
        private readonly IReadOnlyDictionary<int, INType> _types;
        private TaskCompletionSource<DSearchResult> _searchCompletionSource;

        public SearchService(IServerApiService apiService, ServerCallback callback, INPerson person, IReadOnlyDictionary<int, INType> types)
        {
            callback.RegisterCallbackSearchListener(this);
            _apiService = apiService;
            _person = person;
            _types = types;
        }

        public Task<DSearchResult> Search(string filter)
        {
            var request = Request(filter);
            var searchDefinition = CreateSearchDefinition(request);
            _searchCompletionSource = new TaskCompletionSource<DSearchResult>();
            _apiService.AddSearch(searchDefinition);
            return _searchCompletionSource.Task;
        }

        public Task<DSearchResult> SearchObjectWithFilter(string filter, Guid id)
        {
            var request = Request(filter);
            request += $@"+DObject\.Id:{id}";
            var searchDefinition = CreateSearchDefinition(request);
            _searchCompletionSource = new TaskCompletionSource<DSearchResult>();
            _apiService.AddSearch(searchDefinition);
            return _searchCompletionSource.Task;
        }

        public void Notify(DSearchResult result)
        {
            _searchCompletionSource?.TrySetResult(result);
        }

        private string Request(string filter)
        {
            var typesService = new TaskTypesService(_types);
            var searchContext = new NextTaskSearchExpressionContext(_apiService, typesService);
            var searchExpressionFactory = new NextTasksSearchExpressionFactory();

            var localizedSearchExpression =
                searchContext.ToLocalizedExpression(filter.Trim(new[] { '"' }), searchExpressionFactory);
            var request = searchContext.GetSearchRequest(localizedSearchExpression, false); //TODO personal filter
            return request;
        }

        private DSearchDefinition CreateSearchDefinition(string request)
        {
            var searchDefinition = new DSearchDefinition
            {
                Id = Guid.NewGuid(),
                Request =
                {
                    SearchKind = SearchKind.Custom,
                    SearchString = request,
                    MaxResults = 100,
                    SortDefinitions =
                    {
                        new DSortDefinition
                        {
                            FieldName = FieldNames.LEVEL,
                            Ascending = false
                        }
                    }
                }
            };

            return searchDefinition;
        }
    }
}
