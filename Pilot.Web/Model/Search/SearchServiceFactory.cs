using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ascon.Pilot.DataClasses;
using log4net;
using Pilot.Web.Model.Search;
using Pilot.Web.Model.Search.NextTasksSearchExpression;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model
{
    public interface ISearchServiceFactory
    {
        ISearchService GetSearchService(IServerApiService apiService, INPerson person, IReadOnlyDictionary<int, INType> types);
    }

    public interface ISearchService
    {
        Task<DSearchResult> SearchTasks(string filter);
        Task<DSearchResult> SearchTasksWithFilter(string filter, Guid id);
        Task<DSearchResult> SearchObjects(string searchString);
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

        public Task<DSearchResult> SearchTasks(string filter)
        {
            var request = CreateRequestForTask(filter);
            var searchDefinition = CreateSearchDefinition(request);
            _searchCompletionSource = new TaskCompletionSource<DSearchResult>();
            _apiService.AddSearch(searchDefinition);
            return _searchCompletionSource.Task;
        }

        public Task<DSearchResult> SearchTasksWithFilter(string filter, Guid id)
        {
            var request = CreateRequestForTask(filter);
            request += $@"+DObject\.Id:{id}";
            var searchDefinition = CreateSearchDefinition(request);
            _searchCompletionSource = new TaskCompletionSource<DSearchResult>();
            _apiService.AddSearch(searchDefinition);
            return _searchCompletionSource.Task;
        }

        public Task<DSearchResult> SearchObjects(string searchString)
        {
            var request = CreateRequestForObject(searchString);
            // todo for files?
            var searchDefinition = CreateSearchDefinition(request.SearchString);
            _searchCompletionSource = new TaskCompletionSource<DSearchResult>();
            _apiService.AddSearch(searchDefinition);
            return _searchCompletionSource.Task;
        }

        public void Notify(DSearchResult result)
        {
            _searchCompletionSource?.TrySetResult(result);
        }

        private string CreateRequestForTask(string filter)
        {
            var typesService = new TaskTypesService(_types);
            var searchContext = new NextTaskSearchExpressionContext(_apiService, typesService);
            var searchExpressionFactory = new NextTasksSearchExpressionFactory();

            var localizedSearchExpression =
                searchContext.ToLocalizedExpression(filter.Trim(new[] { '"' }), searchExpressionFactory);
            var request = searchContext.GetSearchRequest(localizedSearchExpression, false); //TODO personal filter
            return request;
        }

        private SearchRequest CreateRequestForObject(string searchExpression)
        {
            var searchContext = new SearchExpressionContext(_apiService);
            var searchExpressionFactory = new SearchExpressionFactory();

            var localizedSearchExpression = searchContext.ToLocalizedExpression(searchExpression.Trim(new[] { '"' }), searchExpressionFactory);
            var request = searchContext.GetSearchRequest(localizedSearchExpression); 
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
