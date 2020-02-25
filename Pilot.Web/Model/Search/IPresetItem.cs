namespace Pilot.Web.Model.Search
{
    interface IPresetItem
    {
        string Id { get; }
        string DisplayValue { get; }
        string Data { get; }
        string Hint { get; }
        string Tooltip { get; }
        bool IsVisible { get; }
        bool IsDeleted { get; }
        int Sort { get; }
    }
}