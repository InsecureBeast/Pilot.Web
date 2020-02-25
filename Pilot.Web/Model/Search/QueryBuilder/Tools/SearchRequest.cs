namespace Pilot.Web.Model.Search.QueryBuilder.Tools
{
    public class SearchRequest
    {
        public SearchRequest(string searchString)
            : this(searchString, null, true)
        {

        }

        public SearchRequest(string searchString, string fileSearchString, bool isContextSearch)
        {
            SearchString = searchString;
            FileSearchString = fileSearchString;
            IsContextSearch = isContextSearch;
        }

        public string SearchString { get; }
        public string FileSearchString { get; }
        public bool IsContextSearch { get; }

        public bool IsEmpty => string.IsNullOrEmpty(SearchString) && string.IsNullOrEmpty(FileSearchString);


        public static SearchRequest Empty => new SearchRequest(null);
    }
}
