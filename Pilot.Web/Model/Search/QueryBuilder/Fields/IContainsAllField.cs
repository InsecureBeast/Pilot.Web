
using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public interface IContainsAllField<T> : INamedField
    {
        ISearchTerm ContainsAll(params T[] values);
    }
}