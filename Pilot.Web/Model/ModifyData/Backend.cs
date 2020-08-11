using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Ascon.Pilot.Common;
using Ascon.Pilot.DataClasses;
using Ascon.Pilot.DataModifier;
using Ascon.Pilot.Server.Api.Contracts;

namespace Pilot.Web.Model.ModifyData
{
    public class Backend : IBackend
    {
        private readonly IServerApi _serverApi;
        private readonly DDatabaseInfo _databaseInfo;
        private readonly IMessagesApi _messagesApi;
        private readonly IChangesetUploader _changesetUploader;
        private readonly DPerson _currentPerson;
        private readonly INMetadata _metadata;
        private readonly Dictionary<int, INType> _types;

        public Backend(IServerApi serverApi, DDatabaseInfo databaseInfo, IMessagesApi messagesApi, IChangesetUploader changesetUploader)
        {
            _serverApi = serverApi;
            _databaseInfo = databaseInfo;
            _messagesApi = messagesApi;
            _changesetUploader = changesetUploader;
            _metadata = _serverApi.GetMetadata(databaseInfo.MetadataVersion);
            _types = _metadata.Types.ToDictionary(k => k.Id, v => v);
            _currentPerson = databaseInfo.Person;
        }

        public void SendMessage(INMessage message)
        {
            _messagesApi.SendMessage(message.Dto);
        }

        public void LoadChatMembers(Guid chatId, IResultListener<INChatMember> chatMembersListener)
        {
            var members = _messagesApi.GetChatMembers(chatId, DateTime.UtcNow);
            chatMembersListener.Notify(members, LoadResultKind.Remote);
        }

        public void TypingMessage(Guid chatId)
        {
            _messagesApi.TypingMessage(chatId);
        }

        public Guid GetDatabaseId()
        {
            return _databaseInfo.DatabaseId;
        }

        public IReadOnlyDictionary<int, INType> GetTypes()
        {
            return _types;
        }

        public INPerson CurrentPerson()
        {
            return _currentPerson;
        }

        public IReadOnlyDictionary<int, INPerson> GetPeople()
        {
            var people = _serverApi.LoadPeople().ToDictionary(k => k.Id, v => (INPerson) v);
            return new ReadOnlyDictionary<int, INPerson>(people);
        }

        public IReadOnlyDictionary<int, INOrganisationUnit> GetOrganisationUnits()
        {
            var orgUnits = _serverApi.LoadOrganisationUnits().ToDictionary(k => k.Id, v => (INOrganisationUnit) v);
            return new ReadOnlyDictionary<int, INOrganisationUnit>(orgUnits);
        }

        public INMetadata GetMetadata()
        {
            return _metadata;
        }

        public INObject GetObject(Guid id)
        {
            return _serverApi.GetObjects(new[] { id }).FirstOrDefault();
        }

        public bool Apply(Guid id, IEnumerable<INChange> changes, IEnumerable<Guid> newFileBodies, ChangesetDataSource source = ChangesetDataSource.Native)
        {
            var bodies = newFileBodies.ToList();
            var changesetData = new DChangesetData { Identity = Guid.NewGuid() };
            {
                changesetData.Changes.AddRange(changes.Select(x => x.Dto));
                changesetData.NewFileBodies.AddRange(bodies);
            }

            if (bodies.Any())
                _changesetUploader.Upload(changesetData);

            _serverApi.Change(changesetData);
            return true;
        }

        public void Apply(DPersonUpdateInfo updateInfo)
        {
            _serverApi.UpdatePerson(updateInfo);
        }

        public void Apply(DOrganisationUnitUpdateInfo updateInfo)
        {
            _serverApi.UpdateOrganisationUnit(updateInfo);
        }

        public INSettings GetPersonalSettings()
        {
            return _serverApi.GetPersonalSettings();
        }

        public INSettings GetCommonSettings()
        {
            return _serverApi.GetCommonSettings();
        }

        public void ChangeSettings(INSettingsChange change)
        {
            _serverApi.ChangeSettings(change.Dto);
        }

        public Task<IEnumerable<INHistoryItem>> GetHistoryItemsAsync(IEnumerable<Guid> ids)
        {
            return Task.FromResult<IEnumerable<INHistoryItem>>(_serverApi.GetHistoryItems(ids.ToArray()));
        }
    }
}
