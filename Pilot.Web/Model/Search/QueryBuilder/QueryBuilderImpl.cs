using System.Collections.Generic;
using System.Linq;
using System.Text;
using Ascon.Pilot.DataClasses;
using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;
using Pilot.Web.Model.Search.QueryBuilder.Tools;

namespace Pilot.Web.Model.Search.QueryBuilder
{
    public class QueryBuilderImpl : IQueryBuilder
    {
        readonly StringBuilder _query = new StringBuilder();

        public static IQueryBuilder CreateObjectQueryBuilder(IServerApiService repository)
        {
            return CreateObjectQueryBuilder(repository, new[] { ObjectState.Alive, ObjectState.Frozen });
        }

        public static IQueryBuilder CreateObjectQueryBuilder(IServerApiService repository, ObjectState[] objectStates)
        {
            var userTypes = repository
                .GetTypes()
                .Where(x => x.Value.Kind == TypeKind.User
                            && !x.Value.IsTaskType()
                            && !x.Value.IsWorkflowStageType()
                            && !x.Value.IsWorkflowType())
                .Select(x => x.Value.Id)
                .ToArray();

            var builder = new QueryBuilderImpl();
            builder.Must(ObjectFields.ObjectState.BeAnyOf(objectStates.ToArray()));
            builder.Must(ObjectFields.TypeId.BeAnyOf(userTypes));
            return builder;
        }

        public static IQueryBuilder CreateFilesQueryBuilder(IServerApiService repository)
        {
            var userTypes = repository
                .GetTypes()
                .Where(x => x.Value.Kind == TypeKind.User)
                .Select(x => x.Key)
                .ToArray();

            var builder = new QueryBuilderImpl();
            builder.Must(ObjectFields.TypeId.BeAnyOf(userTypes));
            return builder;
        }

        public static IQueryBuilder CreateEmptyQueryBuilder()
        {
            return new QueryBuilderImpl();
        }

        private QueryBuilderImpl()
        {
        }

        public IQueryBuilder Must(ISearchTerm term)
        {
            _query.Append($" {LuceneHelper.MUST_OPERATOR}{term.ToLuceneString()}");
            return this;
        }

        public IQueryBuilder MustAnyOf(params ISearchTerm[] terms)
        {
            var inner = LuceneHelper.JoinOr(terms.Select(x => x.ToLuceneString()));
            _query.Append($" {LuceneHelper.MUST_OPERATOR}{inner}");
            return this;
        }

        public IQueryBuilder MustNot(ISearchTerm term)
        {
            _query.Append($" {LuceneHelper.MUST_NOT_OPERATOR}{term.ToLuceneString()}");
            return this;
        }

        public IQueryBuilder MustNotAnyOf(params ISearchTerm[] terms)
        {
            var inner = LuceneHelper.JoinOr(terms.Select(x => x.ToLuceneString()));
            _query.Append($" {LuceneHelper.MUST_NOT_OPERATOR}{inner}");
            return this;
        }

        internal static IEnumerable<INType> GetUserTypes(IServerApiService repository)
        {
            return repository
                .GetTypes()
                .Where(x => x.Value.Kind == TypeKind.User
                            && !x.Value.IsTaskType()
                            && !x.Value.IsWorkflowStageType()
                            && !x.Value.IsWorkflowType())
                .Select(x => x.Value);
        }

        public override string ToString()
        {
            return _query.ToString();
        }
    }
}