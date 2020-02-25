using System;
using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public class DateTimeField : FieldBase, IRangeField<DateTime>
    {
        internal DateTimeField(string fieldName) : base(fieldName)
        {
        }

        public string FieldName => _fieldName;

        public ISearchTerm BeInRange(DateTime from, DateTime to)
        {
            return new RangeSearchTerm(_fieldName, ToLucene(from), ToLucene(to));
        }

        /// <summary>
        /// Field exists
        /// </summary>
        /// <returns></returns>
        public ISearchTerm Exists()
        {
            return new ExistsTerm(_fieldName);
        }

        private string ToLucene(DateTime value)
        {
            return LuceneDateTools.DateToString(value, LuceneDateTools.Resolution.SECOND);
        }
    }
}
