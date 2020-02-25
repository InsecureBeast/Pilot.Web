using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ascon.Pilot.Common;
using Ascon.Pilot.DataClasses;
using Pilot.Web.Model.Search.NextTasksSearchExpression;
using Pilot.Web.Model.Search.NextTasksSearchExpression.Tokens;
using Pilot.Web.Model.Search.QueryBuilder;
using Pilot.Web.Model.Search.QueryBuilder.Fields;
using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search
{
    class NextTaskSearchExpressionContext : SearchExpressionContextBase
    {
        private readonly ITaskTypesService _taskTypesService;

        public NextTaskSearchExpressionContext(IServerApiService context, ITaskTypesService taskTypesService) : base(context)
        {
            _taskTypesService = taskTypesService;
        }

        protected override ISearchExpressionContext InvariantCultureContext => new InvariantCultureNextTaskSearchExpressionContext(_context, _taskTypesService);

        public string GetSearchRequest(ISearchExpression expression, bool onlyMy = true)
        {
            var queryBuilder = QueryBuilderImpl.CreateEmptyQueryBuilder();

            var currentUser = _context.GetCurrentPerson();
            var currentUserPositions = currentUser.Positions.ToArray();
            var allTasksTypes = _taskTypesService.AllTaskTypes
                .Union(_taskTypesService.AllWorkflowTypes)
                .ToArray();

            var types = GetTypesFromExpression<NextTaskTypeArgumentToken>(expression, allTasksTypes, out _);
            queryBuilder.Must(ObjectFields.TypeId.BeAnyOf(types.Select(x => x.Id).ToArray()));

            AddAttributesSearch(expression, queryBuilder);

            var myToken = expression.Tokens.OfType<NextTaskMySearchToken>().ToList();
            if ((!currentUser.IsAdmin && onlyMy) || (!currentUser.IsAdmin && !onlyMy && myToken.Any()) || (currentUser.IsAdmin && myToken.Any()))
            {
                var occur = myToken.FirstOrDefault()?.Context?.GetTermOccur() ?? TermOccur.Must;
                var searchObjects = new List<ISearchTerm>();
                var attributeNames = new HashSet<string>();

                foreach (var name in allTasksTypes)
                {
                    attributeNames.UnionWith(name.Attributes.Where(x => x.Type == MAttrType.OrgUnit).Select(x => x.Name));
                }

                foreach (var attribute in attributeNames)
                {
                    var field = new Int32Field(attribute);
                    searchObjects.Add(field.BeAnyOf(currentUserPositions));
                }

                queryBuilder.AddAnyOf(searchObjects.ToArray(), occur);
            }

            var searchPhraseTokens = expression.Tokens.OfType<NextTaskSearchPhraseToken>();
            foreach (var tokenGroup in searchPhraseTokens.GroupBy(x => x.Context.GetTermOccur()))
            {
                var keywords = tokenGroup.Select(x => EscapeKeyword(x.Value)).ToList();
                foreach (var keyword in keywords)
                {
                    queryBuilder.Add(ObjectFields.AllText.Be(keyword), tokenGroup.Key);
                }
            }
            var quotedSearchPhraseTokens = expression.Tokens.OfType<NextTaskQuotedSearchPhraseToken>();
            foreach (var tokenGroup in quotedSearchPhraseTokens.GroupBy(x => x.Context.GetTermOccur()))
            {
                var keywords = tokenGroup.Select(x => EscapeSearchPhrase(x.Value)).ToList();
                foreach (var keyword in keywords)
                {
                    queryBuilder.Add(ObjectFields.AllText.Be(keyword), tokenGroup.Key);
                }
            }
            return queryBuilder.ToString();
        }

        protected override void AddIsSetSearch(IQueryBuilder queryBuilder, string attributeName, TermOccur termOccur)
        {
            if (attributeName == SystemTaskAttributes.DEADLINE_DATE)
            {
                queryBuilder.Add(AttributeFields.DateTime(attributeName).BeInRange(DateTime.MinValue, DateTime.MaxValue.AddDays(-1)), termOccur);
            }
            else
            {
                base.AddIsSetSearch(queryBuilder, attributeName, termOccur);
            }
        }

        public IQueryBuilder GetSearchRequest(SearchKind searchKind)
        {
            var builder = QueryBuilderImpl.CreateEmptyQueryBuilder();

            if (_context == null)
                return builder;

            if (_taskTypesService == null)
                return builder;

            var allTaskTypes = _taskTypesService.AllTaskTypes;
            if (!allTaskTypes.Any())
                return builder;

            var allWorkflowTypes = _taskTypesService.AllWorkflowTypes;
            if (!allWorkflowTypes.Any())
                return builder;

            var notRootTypes = allTaskTypes.Select(x => x.Id).ToList();
            notRootTypes.AddRange(allWorkflowTypes.Select(t => t.Id));
            builder.Must(ObjectFields.TypeId.BeAnyOf(notRootTypes.ToArray()));
            return builder;
        }

        private int[] CollectPersonsPositions(int[] personIds)
        {
            var people = _context.GetPeople();
            var positions = new HashSet<int>();

            foreach (var personId in personIds)
            {
                var person = people[personId];
                foreach (var position in person.Positions)
                {
                    positions.Add(position);
                }
            }

            return positions.ToArray();
        }

        public override IEnumerable<IPresetItem> GetPresetItems(IToken target)
        {
            if (target is OrgUnitMeArgumentToken)
                return new List<IPresetItem>
                {
                    new PresetItem(SearchTokenAliases.AuthorMeTokenAlias, "Me", "all positions of the current user"),
                };

            if (target is UserStateAttributeValueToken userStateAttrTarget)
            {
                return GetUserStatesWithUniqueDisplayNames(userStateAttrTarget);
            }

            if (target is OrgUnitAttributeValueToken)
                return GetOrgUnitAttributePresetItems();

            if (target is AttributeNameTokenBase attrTarget)
                return GetValidAttributesList(attrTarget);

            if (target is NextTaskTypeArgumentToken)
                return GetTypesWithUniqueDisplayNames().Select(x => new PresetItem(x.Value.Id.ToString(), x.Key, x.Value.IsDeleted ? "Deleted type" : null, isDeleted: x.Value.IsDeleted));

            return base.GetPresetItems(target);
        }

        protected override List<INType> GetSearchBrowsableTypes()
        {
            var allTaskTypes = _taskTypesService.AllTaskTypes;
            var allWorkflowTypes = _taskTypesService.AllWorkflowTypes;

            var result = allTaskTypes.Union(allWorkflowTypes).ToList();
            return result;
        }
    }

    class InvariantCultureNextTaskSearchExpressionContext : NextTaskSearchExpressionContext
    {
        public InvariantCultureNextTaskSearchExpressionContext(IServerApiService context, ITaskTypesService taskTypesService)
            : base(context, taskTypesService)
        {
        }

        public override bool IsInvariantCulture => true;
    }
}
