using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public interface IField<T> : INamedField
    {
        ISearchTerm Be(T value);
        ISearchTerm Exists();
    }
}
