using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search.QueryBuilder
{
    static class QueryBuilderExtensions
    {
        public static void Add(this IQueryBuilder builder, ISearchTerm term, TermOccur occur)
        {
            switch (occur)
            {
                case TermOccur.Must:
                    builder.Must(term);
                    break;
                case TermOccur.MustNot:
                    builder.MustNot(term);
                    break;
                default:
                    throw new NotSupportedException($"Occur {occur} is not supported");
            }
        }

        public static void AddAnyOf(this IQueryBuilder builder, ISearchTerm[] terms, TermOccur occur)
        {
            switch (occur)
            {
                case TermOccur.Must:
                    builder.MustAnyOf(terms);
                    break;
                case TermOccur.MustNot:
                    builder.MustNotAnyOf(terms);
                    break;
                default:
                    throw new NotSupportedException($"Occur {occur} is not supported");
            }
        }

        public static TermOccur GetTermOccur(this ITokenContext context)
        {
            const TermOccur DEFAULT_TERM_OCCUR = TermOccur.Must;
            return context[WhitespaceToken.TERM_OCCUR].Value as TermOccur? ?? DEFAULT_TERM_OCCUR;
        }

        public static IEnumerable<IGrouping<AttributeGroup, T>> GroupByAttributeAndOccur<T>(this IEnumerable<T> tokens) where T : TokenBase
        {
            return tokens.GroupBy(token =>
            {
                var attributeName = token.Context[nameof(AttributeNameTokenBase)].Value as string;
                var termOccur = GetTermOccur(token.Context);
                return new AttributeGroup(attributeName, termOccur);
            });
        }
    }

    class AttributeGroup
    {
        public AttributeGroup(string attributeName, TermOccur occur)
        {
            AttributeName = attributeName;
            Occur = occur;
        }

        public string AttributeName { get; }
        public TermOccur Occur { get; }

        protected bool Equals(AttributeGroup other)
        {
            return AttributeName == other.AttributeName && Occur == other.Occur;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((AttributeGroup)obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return ((AttributeName != null ? AttributeName.GetHashCode() : 0) * 397) ^ (int)Occur;
            }
        }
    }
}
