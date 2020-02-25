using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;

namespace Pilot.Web.Model.Search.QueryBuilder
{
    public interface IQueryBuilder
    {
        IQueryBuilder Must(ISearchTerm term);
        IQueryBuilder MustAnyOf(params ISearchTerm[] terms);
        IQueryBuilder MustNot(ISearchTerm term);
        IQueryBuilder MustNotAnyOf(params ISearchTerm[] terms);
    }
}
