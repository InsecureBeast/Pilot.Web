using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ascon.Pilot.DataClasses;
using Ascon.Pilot.DataModifier;
using Ascon.Pilot.Server.Api.Contracts;
using Ascon.Pilot.Transport;
using Pilot.Web.Model.CommonSettings;
using Pilot.Web.Model.DataObjects;
using Pilot.Web.Tools;

namespace Pilot.Web.Model
{
    public interface IServerApiService
    {
        DDatabaseInfo GetDatabaseInfo();
        INMetadata GetMetadata();
        IEnumerable<PObject> GetObjects(Guid[] ids);
        INObject GetObject(Guid id);
        IEnumerable<PObject> GetObjectChildren(Guid id, ChildrenType type);
        IEnumerable<PObject> GetObjectParents(Guid id);
        INType GetType(int id);
        INType GetType(string name);

        Task<IEnumerable<PObject>> GetTasksAsync(string filter);
        Task<IEnumerable<PObject>> GetTasksWithFilterAsync(string filter, Guid taskId);

        ICommonSettings GetPersonalSettings(string key);
        INPerson GetPerson(int id);
        INPerson GetCurrentPerson();

        IReadOnlyDictionary<int, INType> GetTypes();
        void AddSearch(DSearchDefinition searchDefinition);
        IReadOnlyDictionary<int, INPerson> GetPeople();
        IEnumerable<INUserState> GetUserStates();
        INUserStateMachine GetStateMachine(Guid stateMachineId);
        INUserState GetUserState(Guid id);
        IReadOnlyDictionary<int, INOrganisationUnit> GetOrganizationUnits();

        IModifier NewModifier();
        
        Task<ServerCommandRequestResult> InvokeServerCommand(string commandName, byte[] data);
        T GetServerCommandProxy<T>(string commandProcessorName) where T : class;
        ISearchService GetSearchService();
    }

    public class ServerApiService : IServerApiService, IRemoteServiceListener
    {
        private readonly IServerApi _serverApi;
        private readonly DDatabaseInfo _dbInfo;
        private readonly ISearchServiceFactory _searchServiceFactory;
        private INMetadata _metadata;
        private IReadOnlyDictionary<int, INPerson> _people = new Dictionary<int, INPerson>();
        private IReadOnlyDictionary<int, INOrganisationUnit> _orgUnits = new Dictionary<int, INOrganisationUnit>();
        private IReadOnlyDictionary<int, INType> _types = new Dictionary<int, INType>();
        private readonly Dictionary<string, INUserState> _states = new Dictionary<string, INUserState>(StringComparer.OrdinalIgnoreCase);
        private readonly Dictionary<Guid, INUserState> _statesById = new Dictionary<Guid, INUserState>();
        private readonly Dictionary<Guid, INUserStateMachine> _stateMachines = new Dictionary<Guid, INUserStateMachine>();
        private readonly Dictionary<Guid, TaskCompletionSource<ServerCommandRequestResult>> _serverCommands = new Dictionary<Guid, TaskCompletionSource<ServerCommandRequestResult>>();
        private readonly INPerson _currentPerson;
        private readonly IBackend _backend;
        
        public ServerApiService(IServerApi serverApi, DDatabaseInfo dbInfo, ISearchServiceFactory searchServiceFactory, IBackend backend)
        {
            _serverApi = serverApi;
            _dbInfo = dbInfo;
            _searchServiceFactory = searchServiceFactory;
            _currentPerson = dbInfo.Person;
            _backend = backend;

            LoadPeople();
            LoadOrganizationUnits();
            LoadMetadata(0);
        }

        public DDatabaseInfo GetDatabaseInfo()
        {
            return _dbInfo;
        }

        public INMetadata GetMetadata()
        {
            CheckApi();
            return _metadata;
        }

        public IEnumerable<PObject> GetObjectChildren(Guid id, ChildrenType type)
        {
            CheckApi();
            var parent = GetObject(id);
            if (parent == null)
                throw new Exception("Object not found");
            
            var childIds = GetChildrenByType(parent.Dto, type);
            
            var res = new List<PObject>();
            if (childIds.Any())
            {
                var children = _serverApi.GetObjects(childIds);
                res = children.Select(o => new PObject(o, _metadata, _people)).ToList();
                res.Sort(new ObjectComparer());
            }

            var parentType = GetType(parent.TypeId);
            if (parentType.IsMountable && type != ChildrenType.Storage)
            {
                res.Insert(0, new SourcePObject(parent, _metadata, _people, this));
            }
            
            return res;
        }

        public IEnumerable<PObject> GetObjectParents(Guid id)
        {
            CheckApi();

            var parents = new List<PObject>();
            var parentId = id;

            while (true)
            {
                var parent = GetObject(parentId);
                if (parent == null || parent.ParentId == Guid.Empty)
                    return parents;

                var parentType = GetType(parent.TypeId);
                if (parentType.IsMountable)
                {
                    parents.Insert(0, new SourcePObject(parent, _metadata, _people, this));
                }

                parents.Insert(0, new PObject(parent, _metadata, _people));
                parentId = parent.ParentId;
            }
        }

        public INType GetType(int id)
        {
            CheckApi();
            return _types[id];
        }

        public INType GetType(string name)
        {
            CheckApi();
            foreach (var type in _types)
            {
                if (type.Value.Name == name)
                    return type.Value;
            }
            return MType.Null;
        }

        public async Task<IEnumerable<PObject>> GetTasksAsync(string filter)
        {
            var searchService = GetSearchService();
            var searchResult = await searchService.SearchTasks(filter);
            if (searchResult.Found == null)
                return Array.Empty<PObject>();

            var objects = GetObjects(searchResult.Found.ToArray());
            var tasks = LoadTasks(objects, searchResult.Found);
            return tasks;
        }

        public async Task<IEnumerable<PObject>> GetTasksWithFilterAsync(string filter, Guid taskId)
        {
            var searchService = GetSearchService();
            var searchResult = await searchService.SearchTasksWithFilter(filter, taskId);
            if (searchResult.Found == null)
                return Enumerable.Empty<PObject>();

            var objects = GetObjects(searchResult.Found.ToArray());
            var tasks = LoadTasks(objects, searchResult.Found);
            return tasks;
        }

        public IEnumerable<PObject> GetObjects(Guid[] ids)
        {
            CheckApi();
            if (ids == null)
                return Array.Empty<PObject>();

            if (ids.Length == 0)
                return Array.Empty<PObject>();

            var array = _serverApi.GetObjects(ids);
            var res = array.Select(o => new PObject(o, _metadata, _people));
            return res;
        }

        public INObject GetObject(Guid id)
        {
            var objects = _serverApi.GetObjects(new[] { id });
            var dObject = objects.FirstOrDefault();
            return dObject;
        }

        public ICommonSettings GetPersonalSettings(string key)
        {
            CheckApi();
            var settingsProvider = new CommonSettingsProvider(_serverApi, _currentPerson);
            return settingsProvider.GetSetting(key);
        }

        public INPerson GetPerson(int id)
        {
            return _people[id];
        }

        public INPerson GetCurrentPerson()
        {
            return _currentPerson;
        }

        public IReadOnlyDictionary<int, INType> GetTypes()
        {
            return _types;
        }

        public IReadOnlyDictionary<int, INPerson> GetPeople()
        {
            return _people;
        }

        public IEnumerable<INUserState> GetUserStates()
        {
            return _metadata.UserStates;
        }

        public INUserStateMachine GetStateMachine(Guid stateMachineId)
        {
            return !_stateMachines.TryGetValue(stateMachineId, out var result) ? MUserStateMachine.Null : result;
        }

        public INUserState GetUserState(Guid id)
        {
            return !_statesById.TryGetValue(id, out var result) ? MUserState.Null : result;
        }

        public IReadOnlyDictionary<int, INOrganisationUnit> GetOrganizationUnits()
        {
            return _orgUnits;
        }

        public IModifier NewModifier()
        {
            return new Modifier(_backend);
        }

        public void AddSearch(DSearchDefinition searchDefinition)
        {
            _serverApi.AddSearch(searchDefinition);
        }

        private void CheckApi()
        {
            if (_serverApi == null)
                throw new ArgumentException(nameof(_serverApi));
        }

        private void LoadPeople()
        {
            CheckApi();
            _people = _serverApi.LoadPeople().ToDictionary(k => k.Id, v => (INPerson)v);
        }

        private void LoadOrganizationUnits()
        {
            CheckApi();
            _orgUnits = _serverApi.LoadOrganisationUnits().ToDictionary(k => k.Id, v => (INOrganisationUnit)v);
        }

        private void LoadMetadata(long version)
        {
            CheckApi();
            _metadata = _serverApi.GetMetadata(version);
            _types = _metadata.Types.ToDictionary(k => k.Id, v => v);
            
            _states.Clear();
            _statesById.Clear();
            foreach (var state in _metadata.UserStates)
            {
                _states[state.Name] = state;
                _statesById[state.Id] = state;
            }

            _stateMachines.Clear();
            foreach (var stateMachine in _metadata.StateMachines)
            {
                _stateMachines[stateMachine.Id] = stateMachine;
            }
        }

        private static IEnumerable<PObject> LoadTasks(IEnumerable<PObject> objects, IEnumerable<Guid> found)
        {
            var searchResult = new HashSet<Guid>(found ?? Enumerable.Empty<Guid>());
            var loadedObjectsList = objects.ToList();
            var duplicates = loadedObjectsList.Where(x => x.Context.Any(searchResult.Contains)).Select(x => x.Id);

            var objectListToShow = loadedObjectsList
                .Where(x => !duplicates.Contains(x.Id))
                .ToList();

            return objectListToShow;
        }

        private Guid[] GetChildrenByType(DObject obj, ChildrenType type)
        {
            var childIds = new Guid[0];
            switch (type)
            {
                case ChildrenType.All:
                    childIds = obj.Children.Select(c => c.ObjectId).ToArray();
                    break;
                case ChildrenType.ListView:
                    childIds = obj.GetChildrenForListView(this).ToArray();
                    break;
                case ChildrenType.TreeView:
                    break;
                case ChildrenType.Storage:
                    childIds = obj.GetChildrenForPilotStorage(this).ToArray();
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(type), type, null);
            }

            return childIds;
        }

        public void Notify(DMetadataChangeset changeset)
        {
            if (changeset == null || changeset.Version == 0)
                return;

            LoadMetadata(changeset.Version);
        }

        public void Notify(OrganisationUnitChangeset changeset)
        {
            LoadOrganizationUnits();
        }

        public void Notify(PersonChangeset changeset)
        {
            LoadPeople();
        }

        public T GetServerCommandProxy<T>(string commandProcessorName) where T : class
        {
            var callService = new ServerCommandCallService<T>(this, commandProcessorName);
            return new Marshaller(callService).Get<T>();
        }

        public ISearchService GetSearchService()
        {
            CheckApi();
            return _searchServiceFactory.GetSearchService(this, _currentPerson, _types);
        }

        public void UpdateCommandResult(Guid requestId, byte[] data, ServerCommandResult result)
        {
            if (_serverCommands.TryGetValue(requestId, out var tcs))
                tcs.SetResult(new ServerCommandRequestResult(data, (ServerCommandResult)(int)result));
        }

        public Task<ServerCommandRequestResult> InvokeServerCommand(string commandName, byte[] data)
        {
            var requestId = Guid.NewGuid();
            var tcs = new TaskCompletionSource<ServerCommandRequestResult>();
            _serverCommands[requestId] = tcs;
            InvokeServerCommand(commandName, requestId, data);
            return tcs.Task;
        }

        private void InvokeServerCommand(string commandName, Guid requestId, byte[] data)
        {
            try
            {
                _serverApi.InvokeCommand(commandName, requestId, data);
            }
            catch (Exception e)
            {
                UpdateCommandError(requestId, e);
            }
        }

        private void UpdateCommandError(Guid requestId, Exception exception)
        {
            if (_serverCommands.TryGetValue(requestId, out var tcs))
                tcs.SetException(exception);
        }
    }
}
