using System;
using System.Linq;
using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;

namespace Pilot.Web.Model.Search.QueryBuilder.Fields
{
    public class GuidField : FieldBase, IField<Guid>, IAnyOfField<Guid>
    {
        internal GuidField(string fieldName) : base(fieldName)
        {
        }

        public string FieldName => _fieldName;

        protected virtual string GuidStringFormat => string.Empty;

        public ISearchTerm Be(Guid value)
        {
            return new SimpleSearchTerm(_fieldName, value.ToString(GuidStringFormat));
        }

        public ISearchTerm Exists()
        {
            return new ExistsTerm(_fieldName);
        }

        public ISearchTerm BeAnyOf(params Guid[] values)
        {
            return new AnyOfSearchTerm(_fieldName, values.Select(x => x.ToString(GuidStringFormat)));
        }
    }

    public class UserStateIdField : GuidField
    {
        internal UserStateIdField(string fieldName) : base(fieldName)
        {
        }

        protected override string GuidStringFormat => "N";
    }
}