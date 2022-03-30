using System.Collections.Generic;
using Ascon.Pilot.DataClasses;

namespace Pilot.Web.Tools.Numerator
{
    public interface INumeratorKeywordProvider<T>
    {
        object GetValue(T obj, string keyword);
        IEnumerable<object> GetValues(T obj, string keyword);
    }

    public interface IContextFactory<T>
    {
        T GetContext(INObject obj);
    }
}
