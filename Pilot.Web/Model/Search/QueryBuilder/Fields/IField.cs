using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public interface IField<T> : IField
    {
        ISearchTerm Be(T value);
    }

    public interface IField
    {
        ISearchTerm Exists();
    }
}
