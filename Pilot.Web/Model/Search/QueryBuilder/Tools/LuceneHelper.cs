using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pilot.Web.Model.Search.QueryBuilder.Tools
{
    internal static class LuceneHelper
    {
        public const string TERM_FORMAT = "{0}:{1}";
        public const string RANGE_FORMAT = "[{0} TO {1}]";
        public const string SUBQUERY_FORMAT = "({0})";
        public const string MUST_OPERATOR = "+";
        public const string MUST_NOT_OPERATOR = "-";

        public static string JoinOr(IEnumerable<string> values)
        {
            return $"({string.Join(" OR ", values)})";
        }
    }
}
