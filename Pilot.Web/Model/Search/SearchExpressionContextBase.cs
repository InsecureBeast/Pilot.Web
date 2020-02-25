using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ascon.Pilot.Common;
using Ascon.Pilot.DataClasses;
using Lucene.Net.QueryParsers.Classic;
using Pilot.Web.Model.Search.QueryBuilder;
using Pilot.Web.Model.Search.QueryBuilder.Fields;
using Pilot.Web.Model.Search.QueryBuilder.SearchTerms;
using Pilot.Web.Model.Search.QueryBuilder.Tools;
using Pilot.Web.Model.Search.Tokens;

namespace Pilot.Web.Model.Search
{
    class UserStateSearchItem
    {
        public INUserState State { get; }
        public string Tooltip { get; set; }

        public UserStateSearchItem(INUserState state)
        {
            State = state;
        }
    }

    abstract class SearchExpressionContextBase : ISearchExpressionContext
    {
        protected readonly IServerApiService _context;

        protected SearchExpressionContextBase(IServerApiService context)
        {
            _context = context;
        }

        public static string EscapeSearchPhrase(string value)
        {
            var allEscaped = ((value.Length - value.TrimEnd('\\').Length) % 2) == 0;
            return $"\"{(allEscaped ? value : value + "\\")}\"";
        }

        public static string EscapeKeyword(string value)
        {
            return QueryParserBase.Escape(value).Replace("\\*", "*").Replace("\\?", "?");
        }

        public virtual bool IsInvariantCulture => false;

        public virtual IEnumerable<IPresetItem> GetPresetItems(IToken target)
        {
            var today = DateTime.Today;
            var weekStart = DatesRangeLimits.GetStartOfTheWeek(today);
            if (target is DateTextArgumentToken)
                return new List<IPresetItem>
            {
                new PresetItem(DateTextArgumentToken.Today, "today", today.ToString(DateRangeToken.FullDateStringFormat)),
                new PresetItem(DateTextArgumentToken.Yesterday, "yesterday", today.AddDays(-1).ToString(DateRangeToken.FullDateStringFormat)),
                new PresetItem(DateTextArgumentToken.ThisWeek, "this week", $"{weekStart.ToString(DateRangeToken.FullDateStringFormat)}{SearchTokenAliases.DateRangeTokenAlias}{weekStart.AddDays(7).ToString(DateRangeToken.FullDateStringFormat)}"),
                new PresetItem(DateTextArgumentToken.LastWeek, "last week", $"{weekStart.AddDays(-14).ToString(DateRangeToken.FullDateStringFormat)}{SearchTokenAliases.DateRangeTokenAlias}{weekStart.AddDays(-7).ToString(DateRangeToken.FullDateStringFormat)}"),
                new PresetItem(DateTextArgumentToken.ThisMonth, "this month", today.ToString(DateRangeToken.ShortDateStringFormat)),
                new PresetItem(DateTextArgumentToken.LastMonth, "last month", today.AddMonths(-1).ToString(DateRangeToken.ShortDateStringFormat)),
                new PresetItem(DateTextArgumentToken.ThisYear, "this year", today.ToString("yyyy")),
                new PresetItem(DateTextArgumentToken.LastYear, "last year", today.AddYears(-1).ToString("yyyy"))
            };

            if (target is YearToken)
            {
                var targetIsEmpty = string.IsNullOrEmpty(((YearToken)target).Value);

                var year = DateTime.Today.Year;
                var years = new List<IPresetItem> { new PresetItem(year.ToString(), year.ToString(), targetIsEmpty && !((YearToken)target).GetIsTopSubgroup() ? "specify custom date or range" : "specify a year") };

                if (targetIsEmpty)
                    return years;

                for (var delta = 1; delta < 16; delta++)
                {
                    var prevYear = (year - delta).ToString();
                    years.Add(new PresetItem(prevYear, prevYear));
                }

                return years;
            }

            if (target is MonthToken)
            {
                var months = new List<IPresetItem>();
                for (var month = 0; month < 12; month++)
                {
                    var monthString = (month + 1).ToString("D2");
                    months.Add(new PresetItem(monthString, monthString));
                }

                return months;
            }

            if (target is DayToken)
            {
                var days = new List<IPresetItem>();
                for (var day = 0; day < 31; day++)
                {
                    var monthString = (day + 1).ToString("D2");
                    days.Add(new PresetItem(monthString, monthString));
                }

                return days;
            }

            if (target is NumberAttributeValueToken)
                return new List<IPresetItem>
                {
                    new PresetItem(string.Empty, string.Empty, "enter numeric value or range"),
                };

            if (target is OrgUnitAttributeValueToken)
                return GetOrgUnitAttributePresetItems();

            return new List<IPresetItem>();
        }

        protected IEnumerable<IPresetItem> GetOrgUnitAttributePresetItems()
        {
            return GetPersonsWithUniqueDisplayNames().Select(x => new PresetItem(x.Value.Id.ToString(), x.Key, x.Value.IsDeleted ? "Deleted person" : null, isDeleted: x.Value.IsDeleted)).Where(x => !string.IsNullOrEmpty(x.DisplayValue));
        }

        public virtual IList<IToken> ValidateNextTokens(ISearchExpression expression, IToken token, IList<IToken> nextTokens)
        {
            return nextTokens;
        }

        class NumAttributeRange
        {
            public string AttrName { get; }
            public bool IsFloat { get; }
            public double From { get; }
            public double? To { get; }
            public ITokenContext Context { get; }

            public NumAttributeRange(string attrName, bool isFloat, double from, double? to, ITokenContext context)
            {
                AttrName = attrName;
                IsFloat = isFloat;
                From = from;
                To = to;
                Context = context;
            }
        }

        protected virtual void AddIsSetSearch(IQueryBuilder queryBuilder, string attributeName, TermOccur termOccur)
        {
            var term = new ExistsTerm(attributeName);
            queryBuilder.Add(term, termOccur);
        }

        protected void AddAttributesSearch(ISearchExpression expression, IQueryBuilder attributesQueryBuilder)
        {
            if (attributesQueryBuilder == null)
                return;

            var attributeIsSetTokens = expression.Tokens.OfType<AttributeIsSetToken>().ToList();
            foreach (var group in attributeIsSetTokens.GroupByAttributeAndOccur())
            {
                AddIsSetSearch(attributesQueryBuilder, group.Key.AttributeName, group.Key.Occur);
            }

            var stringAttributeValueTokens = expression.Tokens.OfType<StringAttributeValueToken>().ToList();
            foreach (var group in stringAttributeValueTokens.GroupByAttributeAndOccur())
            {
                var attributeName = group.Key.AttributeName;
                var field = new StringField(attributeName);

                var values = group.Select(token => EscapeStringValue(token.Value));
                attributesQueryBuilder.AddAnyOf(values.Select(x => field.Be(x)).ToArray(), group.Key.Occur);
            }

            var orgUnitValueTokens = expression.Tokens.OfType<OrgUnitAttributeValueToken>().ToList();
            foreach (var group in orgUnitValueTokens.GroupByAttributeAndOccur())
            {
                var attributeName = group.Key.AttributeName;
                var field = new Int32Field(attributeName);

                var positions = group
                    .Select(token => token is OrgUnitMeArgumentToken
                        ? _context.GetCurrentPerson()
                        : _context.GetPerson(Convert.ToInt32(token.Id)))
                    .SelectMany(x => x.Positions)
                    .Distinct()
                    .ToArray();
                attributesQueryBuilder.Add(field.BeAnyOf(positions), group.Key.Occur);
            }

            var stateAttributeValueTokens = expression.Tokens.OfType<UserStateAttributeValueToken>().ToList();
            foreach (var group in stateAttributeValueTokens.GroupByAttributeAndOccur())
            {
                var field = new GuidField(group.Key.AttributeName);
                attributesQueryBuilder.Add(field.BeAnyOf(group.Select(x => Guid.Parse(x.Id)).Distinct().ToArray()), group.Key.Occur);
            }

            var dateAttributesNames = expression.Tokens.OfType<DateAttributeNameToken>();
            foreach (var dateAttributeNameToken in dateAttributesNames)
            {
                var dateFieldName = dateAttributeNameToken.Data;
                var dateField = new DateTimeField(dateFieldName);
                AddDateSearch(
                    token => token.Context[TokenBase.GroupParentKey].Value is DateAttributeNameToken && token.Context[nameof(AttributeNameTokenBase)].Value as string == dateFieldName,
                    datesRange => dateField.BeInRange(datesRange.FromUtc, datesRange.ToUtc),
                    null,
                    expression, attributesQueryBuilder, null);
            }

            var numberAttributeTokens = expression.Tokens.OfType<NumberAttributeValueToken>().ToList();
            var fromNumAttributesTokens = numberAttributeTokens.Where(x => (bool?)x.Context[RangeToken.IsRangeTopKey].Value != true).ToList();
            var toNumAttributesTokens = numberAttributeTokens.Where(x => (bool?)x.Context[RangeToken.IsRangeTopKey].Value == true).ToList();

            var numAttributesRanges = new List<NumAttributeRange>();
            foreach (var fromRangeToken in fromNumAttributesTokens)
            {
                var attributeName = fromRangeToken.Context[nameof(AttributeNameTokenBase)].Value as string;
                var fromValue = double.Parse(fromRangeToken.Value, CultureInfo.InvariantCulture);
                var isFloat = fromRangeToken.Context[nameof(FloatNumberAttributeNameToken)].Value != null;

                if (fromRangeToken.Context[TokenBase.GroupParentKey].Value is NumberAttributeGreaterToken)
                {
                    numAttributesRanges.Add(new NumAttributeRange(attributeName, isFloat, fromValue, double.PositiveInfinity, fromRangeToken.Context));
                    continue;
                }

                if (fromRangeToken.Context[TokenBase.GroupParentKey].Value is NumberAttributeLessToken)
                {
                    numAttributesRanges.Add(new NumAttributeRange(attributeName, isFloat, double.NegativeInfinity, fromValue, fromRangeToken.Context));
                    continue;
                }

                var groupParent = fromRangeToken.Context[TokenBase.GroupParentKey].Value;
                var toRangeToken = toNumAttributesTokens.FirstOrDefault(x => ReferenceEquals(groupParent, x.Context[TokenBase.GroupParentKey].Value));
                var toValue = toRangeToken != null ? (double?)double.Parse(toRangeToken.Value, CultureInfo.InvariantCulture) : null;

                numAttributesRanges.Add(new NumAttributeRange(attributeName, isFloat, fromValue, toValue, fromRangeToken.Context));
            }

            foreach (var range in numAttributesRanges)
            {
                var doubleFiled = new DoubleField(range.AttrName);
                var longField = new Int64Field(range.AttrName);

                var fromDoubleValue = range.From;
                var fromLongValue = double.IsNegativeInfinity(fromDoubleValue) ? long.MinValue : Convert.ToInt64(Math.Floor(fromDoubleValue));

                if (range.To == null)
                {
                    var searchTerm = range.IsFloat ? doubleFiled.Be(fromDoubleValue) : longField.Be(fromLongValue);
                    attributesQueryBuilder.Add(searchTerm, range.Context.GetTermOccur());
                }
                else
                {
                    var toDoubleValue = (double)range.To;
                    var toLongValue = double.IsPositiveInfinity(toDoubleValue) ? long.MaxValue : Convert.ToInt64(Math.Floor(toDoubleValue));

                    var searchTerm = range.IsFloat ? doubleFiled.BeInRange(fromDoubleValue, toDoubleValue) : longField.BeInRange(fromLongValue, toLongValue);
                    attributesQueryBuilder.Add(searchTerm, range.Context.GetTermOccur());
                }
            }
        }

        protected void AddDateSearch(
            Func<TokenBase, bool> tokenFilter,
            Func<DatesRangeLimits, ISearchTerm> toObjectSearchTerm,
            Func<DatesRangeLimits, ISearchTerm> toFileSearchTerm,
            ISearchExpression expression,
            IQueryBuilder attributesQueryBuilder,
            IQueryBuilder filesQueryBuilder)
        {
            var dateRangeTokens = expression.Tokens.OfType<TokenBase>().Where(x => tokenFilter(x)).ToList();
            var dateRangeGroups = dateRangeTokens.GroupBy(x => x.Context[RangeToken.RangeGroupKey].Value).Where(g => g.Key != null);

            var dateRanges = new List<DatesRangeLimits>();

            foreach (var group in dateRangeGroups)
            {
                var dateTextPresetToken = (DateTextArgumentToken)group.FirstOrDefault(x => x is DateTextArgumentToken);
                if (dateTextPresetToken != null)
                {
                    var presetRange = DatesRangeLimits.GetRangeLimits(dateTextPresetToken);
                    dateRanges.Add(presetRange);
                    continue;
                }

                var groupTail = group.Last();
                var from = groupTail.Context[RangeToken.FromValueKey].Value;
                var to = groupTail.Context[RangeToken.ToValueKey].Value;
                if (from == null || to == null)
                    continue;

                var range = new DatesRangeLimits((DateTime)from, (DateTime)to);

                if (groupTail.Context[RangeToken.RangeKindKey].Value is DateAttributeGreaterToken)
                    range = DatesRangeLimits.GreaterThanRange(range);

                if (groupTail.Context[RangeToken.RangeKindKey].Value is DateAttributeLessToken)
                    range = DatesRangeLimits.LessThanRange(range);

                dateRanges.Add(range);
            }

            if (!dateRanges.Any())
                return;

            var context = dateRangeTokens.First().Context;

            attributesQueryBuilder?.AddAnyOf(dateRanges.Select(toObjectSearchTerm).ToArray(), context.GetTermOccur());
            filesQueryBuilder?.AddAnyOf(dateRanges.Select(toFileSearchTerm).ToArray(), context.GetTermOccur());
        }

        protected void AddIntFieldSearch<TTokenType>(Func<int[], int[]> sourceValuesToValues, Action<IQueryBuilder, int[], TermOccur> valuesToBuilder, ISearchExpression expression, IQueryBuilder queryBuilder)
            where TTokenType : ArgumentToken
        {
            if (queryBuilder == null)
                return;

            var tokens = expression.Tokens.OfType<TTokenType>().ToList();
            foreach (var tokenGroup in tokens.GroupBy(x => x.Context.GetTermOccur()))
            {
                var sourceValues = tokenGroup
                    .Select(token => int.TryParse(token.Id, out var intValue) ? (int?)intValue : null)
                    .Where(value => value != null)
                    .OfType<int>()
                    .ToArray();

                var values = sourceValuesToValues(sourceValues);

                if (values.Any())
                    valuesToBuilder(queryBuilder, values, tokenGroup.Key);
            }
        }

        protected void AddEnumFieldSearch<TTokenType, TEnumType>(Func<TEnumType[], ISearchTerm> valuesToTerm, ISearchExpression expression, IQueryBuilder queryBuilder)
            where TTokenType : ArgumentToken
            where TEnumType : struct, IConvertible
        {
            if (queryBuilder == null)
                return;

            var tokenGroups = expression.Tokens
                .OfType<TTokenType>()
                .GroupBy(x => x.Context.GetTermOccur());

            foreach (var tokenGroup in tokenGroups)
            {
                var values = tokenGroup
                    .Select(token => Enum.TryParse(token.Id, out TEnumType enumValue) ? (TEnumType?)enumValue : null)
                    .Where(value => value != null)
                    .OfType<TEnumType>()
                    .ToArray();

                if (values.Any())
                    queryBuilder.Add(valuesToTerm(values), tokenGroup.Key);
            }
        }

        protected List<PresetItem> GetUserStatesWithUniqueDisplayNames(UserStateAttributeValueToken target)
        {
            var allUserState = _context.GetUserStates().Select(x => new UserStateSearchItem(x)).ToList();
            var suggestibleUserStates = GetValidUserStatesList(target);

            var userStatesWithUniqueDisplayNames = GetObjectsWithUniqueNames(allUserState, x => x.State.Title, x => x.State.Name);
            var resultUserStates = userStatesWithUniqueDisplayNames.Where(x => !string.IsNullOrEmpty(x.Key))
                .Select(x =>
                {
                    var suggestibleUserState = suggestibleUserStates.FirstOrDefault(ss => ss.State.Name.Equals(x.Value.State.Name, StringComparison.OrdinalIgnoreCase));

                    var presetItem = new PresetItem(
                        id: x.Value.State.Id.ToString(),
                        displayValue: x.Key,
                        hint: x.Value.State.IsDeleted ? "Deleted state" : null,
                        isVisible: suggestibleUserState != null,
                        isDeleted: x.Value.State.IsDeleted)
                    {
                        Tooltip = suggestibleUserState?.Tooltip
                    };

                    return presetItem;
                })
                .ToList();

            return resultUserStates;
        }


        private List<UserStateSearchItem> GetValidUserStatesList(UserStateAttributeValueToken target)
        {
            var specifiedTypesNames = target.Context[nameof(TypeArgumentToken)].Value as List<string> ?? new List<string>();
            specifiedTypesNames = specifiedTypesNames.Where(x => !string.IsNullOrEmpty(x)).ToList();
            var types = _context.GetTypes()
                .OrderBy(x => x.Value.IsDeleted)
                .ThenBy(x => x.Value.Sort)
                .Where(x => IsUserType(x.Value) && (!specifiedTypesNames.Any() || specifiedTypesNames.Contains(x.Value.Id.ToString())))
                .ToList();

            var specifiedAttributeName = target.Context[nameof(AttributeNameTokenBase)].Value as string;

            var attributeTypePairs = types
                .Select(t => new Tuple<INAttribute, INType>(t.Value.Attributes.FirstOrDefault(a => a.Name == specifiedAttributeName), t.Value))
                .Where(pair => pair.Item1 != null)
                .ToList();

            var validUserStates = BuildItemsIntersection(
                sourceElements: attributeTypePairs,
                intersect: specifiedTypesNames.Count > 1,
                buildItemsForElement: attributeTypePair =>
                {
                    var stateMachineId = attributeTypePair.Item1.ParsedConfiguration().StateMachineId;

                    var stateMachine = _context.GetStateMachine(stateMachineId);

                    var presetItems = stateMachine.StateTransitions
                        .Select(state => _context.GetUserState(state.Key))
                        .Where(state => state != null)
                        .ToDictionary(state => state.Name, state => new UserStateSearchItem(state) { Tooltip = attributeTypePair.Item2.Title });

                    return presetItems;
                },
                onItemDuplicated: (presetItem, attributeTypePair) =>
                {
                    presetItem.Tooltip += GetTooltipEntryForType(attributeTypePair.Item2);
                });

            return validUserStates;
        }

        protected Dictionary<string, INPerson> GetPersonsWithUniqueDisplayNames()
        {
            var people = _context.GetPeople();
            var alivePeople = people.Where(x => !x.Value.IsDeleted).OrderBy(x => x.Value.ActualName());
            var deletedPeople = people.Where(x => x.Value.IsDeleted).OrderBy(x => x.Value.ActualName());

            var personList = alivePeople.ToList();
            personList.AddRange(deletedPeople);
            return GetObjectsWithUniqueNames(personList.Select(x => x.Value), x => x.DisplayName, x => x.Login);
        }

        protected static Dictionary<string, T> GetObjectsWithUniqueNames<T>(IEnumerable<T> objects, Func<T, string> getDisplayName, Func<T, string> getUniqueId)
        {
            var dictionaryByName = new Dictionary<string, T>();

            foreach (var obj in objects)
            {
                var displayName = getDisplayName(obj);
                var uniqueId = getUniqueId(obj);
                var objectKey = !string.IsNullOrWhiteSpace(displayName) && !dictionaryByName.ContainsKey(displayName)
                    ? displayName
                    : string.IsNullOrWhiteSpace(displayName)
                        ? uniqueId
                        : $"{displayName} ({uniqueId})".Trim();

                var index = 2;
                while (dictionaryByName.ContainsKey(objectKey))
                {
                    objectKey = index == 2
                        ? $"{objectKey} ({index})"
                        : objectKey.Replace($"({index - 1})", $"({index})");
                    index++;
                }

                dictionaryByName.Add(objectKey, obj);
            }

            return dictionaryByName;
        }

        protected IEnumerable<INType> GetTypesFromExpression<TTokenType>(
            ISearchExpression expression,
            IReadOnlyList<INType> supportedTypes,
            out bool isFiltered)
            where TTokenType : TypeArgumentToken
        {
            isFiltered = false;
            var typeIds = new HashSet<int>(supportedTypes.Select(x => x.Id));
            var typeTokens = expression.Tokens.OfType<TTokenType>().ToList();
            if (typeTokens.Any())
            {
                var mustTypes = GetTypesFromTokens(typeTokens.Where(x => x.Context.GetTermOccur() == TermOccur.Must));
                typeIds.IntersectWith(mustTypes.Select(x => x.Id));

                var mustNotTypes = GetTypesFromTokens(typeTokens.Where(x => x.Context.GetTermOccur() == TermOccur.MustNot));
                typeIds.ExceptWith(mustNotTypes.Select(x => x.Id));

                isFiltered = true;
            }

            var attributeTokens = expression.Tokens.OfType<AttributeNameTokenBase>().ToList();
            if (attributeTokens.Any())
            {
                var attributeNames = new HashSet<string>(attributeTokens.Select(x => x.Value).Distinct());
                var attributeTypes = supportedTypes
                    .Where(t => t.Attributes.Any(a => attributeNames.Contains(a.Title)))
                    .Select(x => x.Id);

                typeIds.IntersectWith(attributeTypes);

                isFiltered = true;
            }
            return supportedTypes.Where(t => typeIds.Contains(t.Id));
        }

        protected List<INType> GetTypesFromTokens(IEnumerable<TypeArgumentToken> typeArguments)
        {
            var ids = new List<INType>();
            var types = GetTypesWithUniqueDisplayNames();
            foreach (var typeToken in typeArguments)
            {
                if (types.TryGetValue(typeToken.Value, out var type))
                    ids.Add(type);
                else
                    throw new ArgumentException($"type &apos;{typeToken.Value}&apos; does not exist");
            }

            return ids;
        }

        protected Dictionary<string, INType> GetTypesWithUniqueDisplayNames()
        {
            var types = GetSearchBrowsableTypes();
            var aliveTypes = types.Where(t => !t.IsDeleted).OrderBy(t => t.Title);
            var deletedTypes = types.Where(t => t.IsDeleted).OrderBy(t => t.Title);

            var typeList = aliveTypes.ToList();
            typeList.AddRange(deletedTypes);
            return GetObjectsWithUniqueNames(typeList.Select(t => t), x => x.Title, x => x.Name);
        }

        protected List<PresetItem> GetValidAttributesList(AttributeNameTokenBase target)
        {
            var specifiedTypesNames = target.Context[nameof(TypeArgumentToken)].Value as List<string> ?? new List<string>();
            specifiedTypesNames = specifiedTypesNames.Where(x => !string.IsNullOrEmpty(x)).ToList();

            var types = GetSearchBrowsableTypes()
                .OrderBy(x => x.IsDeleted)
                .ThenBy(x => x.Sort)
                .Where(x => IsUserType(x) && (!specifiedTypesNames.Any() || specifiedTypesNames.Contains(x.Id.ToString())))
                .ToList();

            var complimentaryTypes = GetComplimentaryAttrTypes(target);

            var validAttributesList = BuildItemsIntersection(
                sourceElements: types,
                intersect: specifiedTypesNames.Count > 1,
                buildItemsForElement: type =>
                {
                    var currentTypePresetItems = new Dictionary<string, PresetItem>();

                    var typeAttrs = type.Attributes.Where(x => complimentaryTypes.Contains(x.Type)).OrderBy(x => x.DisplaySortOrder);

                    foreach (var nAttribute in typeAttrs)
                    {
                        var key = $"{nAttribute.Name}\\{nAttribute.Title}\\{AttrTypeToString(nAttribute.Type)}";
                        var hint = AttrTypeToString(nAttribute.Type);
                        var tooltip = specifiedTypesNames.Count == 1 ? null : GetTooltipEntryForType(type);
                        var presetItem = new PresetItem(nAttribute.Title, nAttribute.Title, nAttribute.Name, hint, true, type.IsDeleted)
                        {
                            Tooltip = tooltip != null ? $"Belongs to following types: {tooltip}" : null,
                            Sort = nAttribute.DisplaySortOrder + type.Sort * 100 + (type.IsDeleted ? 10000 : 0)
                        };

                        currentTypePresetItems.Add(key, presetItem);
                    }

                    return currentTypePresetItems;
                },
                onItemDuplicated: (presetItem, type) =>
                {
                    presetItem.Tooltip += GetTooltipEntryForType(type);
                });

            return validAttributesList;
        }

        protected virtual List<INType> GetSearchBrowsableTypes()
        {
            return _context.GetTypes().Values.Where(x => IsUserType(x)).ToList();
        }

        protected string EscapeStringValue(string value)
        {
            if (string.IsNullOrEmpty(value))
                return value;

            value = value.Length > 1 && value[0] == '"'
                ? EscapeSearchPhrase(value.Replace("\"", string.Empty))
                : EscapeKeyword(value);

            return value;
        }

        enum ListIntersectionMode
        {
            Disabled,
            NextIteration,
            ThisIteration
        }

        protected List<TOut> BuildItemsIntersection<TIn, TOut>(List<TIn> sourceElements, bool intersect, Func<TIn, Dictionary<string, TOut>> buildItemsForElement, Action<TOut, TIn> onItemDuplicated)
        {
            var resultItemsIntersection = new Dictionary<string, TOut>();

            var reduceToIntersection = intersect
                ? ListIntersectionMode.NextIteration
                : ListIntersectionMode.Disabled;

            foreach (var element in sourceElements)
            {
                var presetItemsForCurrentElement = buildItemsForElement(element);

                if (reduceToIntersection == ListIntersectionMode.ThisIteration)
                {
                    var intersection = resultItemsIntersection.Keys.Intersect(presetItemsForCurrentElement.Keys).ToList();
                    foreach (var key in resultItemsIntersection.Keys.ToList())
                    {
                        if (intersection.Contains(key))
                            onItemDuplicated(resultItemsIntersection[key], element);
                        else
                            resultItemsIntersection.Remove(key);
                    }
                }
                else
                {
                    foreach (var key in presetItemsForCurrentElement.Keys)
                    {
                        if (resultItemsIntersection.ContainsKey(key))
                            onItemDuplicated(resultItemsIntersection[key], element);
                        else
                            resultItemsIntersection.Add(key, presetItemsForCurrentElement[key]);
                    }
                }

                if (reduceToIntersection == ListIntersectionMode.NextIteration)
                    reduceToIntersection = ListIntersectionMode.ThisIteration;
            }

            return resultItemsIntersection.Values.ToList();
        }

        protected string GetTooltipEntryForType(INType type)
        {
            return Environment.NewLine + type.Title + (type.IsDeleted ? " - " + "Deleted type" : string.Empty);
        }


        private List<MAttrType> GetComplimentaryAttrTypes(AttributeNameTokenBase token)
        {
            if (token is StringAttributeNameToken)
                return new List<MAttrType> { MAttrType.String, MAttrType.Numerator };

            if (token is DateAttributeNameToken)
                return new List<MAttrType> { MAttrType.DateTime };

            if (token is FloatNumberAttributeNameToken)
                return new List<MAttrType> { MAttrType.Double, MAttrType.Decimal };

            if (token is NumberAttributeNameToken)
                return new List<MAttrType> { MAttrType.Integer };

            if (token is UserStateAttributeNameToken)
                return new List<MAttrType> { MAttrType.UserState };

            if (token is OrgUnitAttributeNameToken)
                return new List<MAttrType> { MAttrType.OrgUnit };

            return new List<MAttrType>();
        }

        private string AttrTypeToString(MAttrType type)
        {
            switch (type)
            {
                case MAttrType.String: return "string";
                case MAttrType.Numerator: return "number";
                case MAttrType.Integer: return "number";
                case MAttrType.Decimal: return "number";
                case MAttrType.Double: return "number";
                case MAttrType.DateTime: return "date";
                case MAttrType.UserState: return "state";
                case MAttrType.OrgUnit: return "orgunit";
            }

                    return string.Empty;
        }

        protected bool IsUserType(INType type)
        {
            return !type.IsService && type.Kind == TypeKind.User;
        }

        public ISearchExpression ToLocalizedExpression(string invariantExpressionString, ISearchExpressionFactory factory)
        {
            var expression = factory.Parse(invariantExpressionString, InvariantCultureContext);
            return expression;
        }

        protected abstract ISearchExpressionContext InvariantCultureContext { get; }

        public string ToInvariantExpressionString(ISearchExpression expression)
        {
            var sb = new StringBuilder();
            foreach (var token in expression.Tokens)
            {
                var keywordToken = token as IKeywordToken;
                if (keywordToken != null)
                {
                    sb.Append(keywordToken.SerializationAlias);
                    continue;
                }

                var argumentToken = token as IArgumentToken;
                if (argumentToken != null)
                {
                    sb.Append(argumentToken.Id ?? argumentToken.Value);
                    continue;
                }

                throw new InvalidOperationException("unknown token class");
            }

            return sb.ToString();
        }
    }
}
