using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public interface IRangeField<T> : INamedField
    {
        ISearchTerm BeInRange(T from, T to);
        ISearchTerm Exists();
    }
}