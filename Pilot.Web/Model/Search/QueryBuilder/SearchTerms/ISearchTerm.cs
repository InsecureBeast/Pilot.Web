namespace Pilot.Web.Model.Search.QueryBuilder.SearchTerms
{
    /// <summary>
    /// Search term. Can be constructed using ObjectFields, TaskFields, AttributeFields or FileFields classes.
    /// </summary>
    public interface ISearchTerm
    {
        /// <summary>
        /// Field name
        /// </summary>
        string FieldName { get; }
        
        /// <summary>
        /// Converts search term to Lucene syntax
        /// </summary>
        /// <returns></returns>
        string ToLuceneString();
    }
}
