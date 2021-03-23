using System;
using System.Collections.Generic;
using System.Linq;
using Ascon.Pilot.Common;
using Ascon.Pilot.DataClasses;
using Pilot.Web.Model.Search.QueryBuilder;
using Pilot.Web.Model.Search.QueryBuilder.Tools;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search
{
    class SearchExpressionContext : SearchExpressionContextBase
    {
        //private readonly IConnectionListener _connectionListener;

        public SearchExpressionContext(IServerApiService context)
            : base(context)
        {
            //_connectionListener = _context.GetConnectionListener(dispatcher);
        }

        protected override ISearchExpressionContext InvariantCultureContext => new InvariantCultureSearchExpressionContext(_context);

        public override IEnumerable<IPresetItem> GetPresetItems(IToken target)
        {
            if (target is SearchModeArgumentToken)
            {
                return new List<IPresetItem>
                {
                    new PresetItem(SearchPresetItemAliases.Attributes, "search by attributes\\"),
                    new PresetItem(SearchPresetItemAliases.Files, "search by files\\"),
                    new PresetItem(SearchPresetItemAliases.FilesAndAttributes, "search by files and attributes\\", isVisible:false)
                };
            }

            if (target is SearchContextArgumentToken)
            {
                return new List<IPresetItem>
                {
                    new PresetItem(SearchContextItemAliases.EntireDatabase, "database\\"),
                    new PresetItem(SearchContextItemAliases.CurrentFolder, "folder\\", "(by default)"),
                };
            }

            if (target is StateArgumentToken)
            {
                return new List<IPresetItem>
                {
                    new PresetItem(ObjectState.Frozen.ToString(), "frozen\\"),
                    new PresetItem(ObjectState.Alive.ToString(), "not frozen\\")
                };
            }

            if (target is TypeArgumentToken)
                return GetTypesWithUniqueDisplayNames().Select(x => new PresetItem(x.Value.Id.ToString(), x.Key, x.Value.IsDeleted ? "deleted type" : null, isDeleted: x.Value.IsDeleted));

            if (target is AttributeNameTokenBase)
                return GetValidAttributesList((AttributeNameTokenBase)target);

            if (target is UserStateAttributeValueToken)
                return GetUserStatesWithUniqueDisplayNames((UserStateAttributeValueToken)target);

            if (target is OrgUnitArgumentToken)
                return GetPersonsWithUniqueDisplayNames().Select(x => new PresetItem(x.Value.Id.ToString(), x.Key, x.Value.IsDeleted ? "deleted person" : null, isDeleted: x.Value.IsDeleted)).Where(x => !string.IsNullOrEmpty(x.DisplayValue));

            return base.GetPresetItems(target);
        }

        public override IList<IToken> ValidateNextTokens(ISearchExpression expression, IToken token, IList<IToken> nextTokens)
        {
            // todo разрешать ли поиск по файлам???
            //var clientFeatures = _context.GetClientFeatures();
            //if (clientFeatures == ClientFeatures.Enterprise || clientFeatures == ClientFeatures.Bim || IsInvariantCulture)
            //{
                if (token.GetType() == typeof(WhitespaceToken))
                {
                    if (!expression.Tokens.Any(x => x is SearchModeToken))
                        nextTokens.Add(new SearchModeToken(true));
                }
            //}

            return nextTokens;
        }

        private ObjectState[] GetObjectStates(ISearchExpression expression)
        {
            var stateToken = expression.Tokens.OfType<StateArgumentToken>().FirstOrDefault();

            return stateToken != null
                ? new[] { (ObjectState)Enum.Parse(typeof(ObjectState), stateToken.Id, true) }
                : new[] { ObjectState.Alive, ObjectState.Frozen };
        }

        protected override List<INType> GetSearchBrowsableTypes()
        {
            return _context
                .GetTypes()
                .Values.Where(x => IsUserType(x)
                                   && !x.IsWorkflowType()
                                   && !x.IsTaskType()
                                   && !x.IsWorkflowStageType()).ToList();
        }

        public SearchRequest GetSearchRequest(ISearchExpression expression)
        {
            var searchTargets = GetSearchTargets(expression);

            var attributesQueryBuilder = searchTargets.HasFlag(SearchTarget.Attributes)
                ? QueryBuilderImpl.CreateEmptyQueryBuilder()
                : null;

            var filesQueryBuilder = searchTargets.HasFlag(SearchTarget.Files)
                ? QueryBuilderImpl.CreateFilesQueryBuilder(_context)
                : null;

            var userTypes = QueryBuilderImpl.GetUserTypes(_context);
            var types = GetTypesFromExpression<TypeArgumentToken>(expression, userTypes.ToList(), out var isFiltered).ToList();
            var typeIds = types.Select(x => x.Id).ToArray();
            attributesQueryBuilder?.Must(ObjectFields.TypeId.BeAnyOf(typeIds));
            filesQueryBuilder?.Must(ObjectFields.TypeId.BeAnyOf(typeIds));

            if (isFiltered && types.All(x => !x.HasFiles))
                filesQueryBuilder = null;

            var objectStates = GetObjectStates(expression);
            attributesQueryBuilder?.Must(ObjectFields.ObjectState.BeAnyOf(objectStates));

            AddAttributesSearch(expression, attributesQueryBuilder);

            var searchPhraseTokens = expression.Tokens.OfType<SearchPhraseToken>();
            foreach (var tokenGroup in searchPhraseTokens.GroupBy(x => x.Context.GetTermOccur()))
            {
                var keywords = tokenGroup.Select(x => EscapeKeyword(x.Value)).ToList();
                foreach (var keyword in keywords)
                {
                    attributesQueryBuilder?.Add(ObjectFields.AllText.Be(keyword), tokenGroup.Key);
                    filesQueryBuilder?.Add(FileFields.FileContent.Be(keyword), tokenGroup.Key);
                }
            }

            var quotedSearchPhraseTokens = expression.Tokens.OfType<QuotedSearchPhraseToken>();
            foreach (var tokenGroup in quotedSearchPhraseTokens.GroupBy(x => x.Context.GetTermOccur()))
            {
                var keywords = tokenGroup.Select(x => EscapeSearchPhrase(x.Value)).ToList();
                foreach (var keyword in keywords)
                {
                    attributesQueryBuilder?.Add(ObjectFields.AllText.Be(keyword), tokenGroup.Key);
                    filesQueryBuilder?.Add(FileFields.FileContent.Be(keyword), tokenGroup.Key);
                }
            }

            var snapshotReasonTokens = expression.Tokens.OfType<SnapshotReasonArgumentToken>();
            foreach (var tokenGroup in snapshotReasonTokens.GroupBy(x => x.Context.GetTermOccur()))
            {
                var snapshotReasons = tokenGroup.Select(x => x.Value).ToList();
                if (snapshotReasons.Any())
                    attributesQueryBuilder?.Add(ObjectFields.AllSnapshotsReason.ContainsAll(snapshotReasons.Select(r => EscapeStringValue(r)).ToArray()), tokenGroup.Key);
            }

            AddIntFieldSearch<AuthorArgumentToken>(ids => ids, (builder, personIds, occur) => builder.Add(ObjectFields.CreatorId.BeAnyOf(personIds), occur), expression, attributesQueryBuilder);

            AddIntFieldSearch<SignatureAwaitingArgumentToken>(ids => GetPositions(_context, ids), (builder, personIds, occur) => builder.Add(ObjectFields.SignatureAwaitingBy.BeAnyOf(personIds), occur), expression, attributesQueryBuilder);
            AddIntFieldSearch<SignedArgumentToken>(ids => GetPositions(_context, ids), (builder, personIds, occur) => builder.Add(ObjectFields.SignedBy.BeAnyOf(personIds), occur), expression, attributesQueryBuilder);


            AddDateSearch(
                token => token.Context[TokenBase.GroupParentKey].Value is CreatedKeywordToken,
                datesRange => ObjectFields.CreatedDate.BeInRange(datesRange.FromUtc, datesRange.ToUtc),
                datesRange => FileFields.CreatedDate.BeInRange(datesRange.FromUtc, datesRange.ToUtc),
                expression, attributesQueryBuilder, filesQueryBuilder);

            AddDateSearch(
                token => token.Context[TokenBase.GroupParentKey].Value is SnapshotCreatedKeywordToken,
                datesRange => ObjectFields.SnapshotsCreated.BeInRange(datesRange.FromUtc, datesRange.ToUtc),
                datesRange => FileFields.CreatedDate.BeInRange(datesRange.FromUtc, datesRange.ToUtc),
                expression, attributesQueryBuilder, filesQueryBuilder);

            var attributesSearchString = attributesQueryBuilder != null
                ? attributesQueryBuilder.ToString()
                : null;

            var filesSearchString = filesQueryBuilder != null
                                    //&& (_context.GetClientFeatures() == ClientFeatures.Enterprise || _context.GetClientFeatures() == ClientFeatures.Bim)
                                    //&& _connectionListener.IsOnline
                ? filesQueryBuilder.ToString()
                : null;

            var searchContextValueToken = expression.Tokens.FirstOrDefault(x => x is SearchContextArgumentToken) as SearchContextArgumentToken;
            var isContextSearch = searchContextValueToken == null || searchContextValueToken.IsContextSearch;

            return new SearchRequest(attributesSearchString, filesSearchString, isContextSearch);
        }

        private static SearchTarget GetSearchTargets(ISearchExpression expression)
        {
            var searchModeToken = (SearchModeArgumentToken)expression.Tokens.FirstOrDefault(x => x is SearchModeArgumentToken);

            return searchModeToken?.SearchTarget ?? SearchTarget.Attributes;
        }
    }

    class InvariantCultureSearchExpressionContext : SearchExpressionContext
    {
        public InvariantCultureSearchExpressionContext(IServerApiService context)
            : base(context)
        {
        }

        public override bool IsInvariantCulture => true;
    }

}
