using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public interface IAnyOfField<T> : INamedField
    {
        ISearchTerm BeAnyOf(params T[] values);
    }
}