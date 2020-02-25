using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools.Numerator
{
    public interface INumeratorKeywordProvider
    {
        object GetValue(INObject obj, string keyword);
    }
}
