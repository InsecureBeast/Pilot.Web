using System;
using System.Collections.Generic;
using System.Linq;
using Ascon.Pilot.Common;
using Ascon.Pilot.DataClasses;
using Pilot.Web.Tools;

namespace Pilot.Web.Model.DataObjects
{
    public class PObject
    {
        public PObject(INObject source, INMetadata metadata, IReadOnlyDictionary<int, INPerson> people)
        {
            Id = source.Id;
            ParentId = source.ParentId;
            LastChange = source.LastChange;
            Children = source.Children;
            Relations = source.Relations;
            Subscribers = source.Subscribers;
            Attributes = source.Attributes.ToDictionary(k => k.Key, v => v.Value.Value);
            ActualFileSnapshot = source.ActualFileSnapshot;
            PreviousFileSnapshots = source.PreviousFileSnapshots;
            Created = source.Created;
            Access = source.Access;
            StateInfo = source.StateInfo;
            SecretInfo = source.SecretInfo;
            Context = source.Context;

            var type = metadata.Types.FirstOrDefault(t => t.Id == source.TypeId);
            Type = new PType(type);
            Title = source.GetTitle(type);
            people.TryGetValue(source.CreatorId, out var nPerson);
            Creator = nPerson;
        }

        public Guid Id { get; protected set; }
        public string Title { get; protected set; }
        public PType Type { get; protected set; }
        public Guid ParentId { get; }
        public long LastChange { get; }
        public IReadOnlyList<DChild> Children { get; protected set; }
        public IReadOnlyList<DRelation> Relations { get; }
        public IEnumerable<int> Subscribers { get; }
        public INPerson Creator { get; }
        public IReadOnlyDictionary<string, object> Attributes { get; }
        public INFilesSnapshot ActualFileSnapshot { get; }
        public IReadOnlyList<INFilesSnapshot> PreviousFileSnapshots { get; }
        public DateTime Created { get; }
        public IReadOnlyList<AccessRecord> Access { get; }
        public INStateInfo StateInfo { get; }
        public SecretInfo SecretInfo { get; }
        public IReadOnlyList<Guid> Context { get; }
    }

    public class SourcePObject : PObject
    {
        public SourcePObject(INObject source, INMetadata metadata, IReadOnlyDictionary<int, INPerson> people, IServerApiService serverApi) : base(source, metadata, people)
        {
            Title = "Source files";
            Children = source.Dto.GetStorageChildren(serverApi).ToList();
            SourceId = source.Id;
            //Id = Guid.Empty;

            var type = metadata.Types.FirstOrDefault(t => t.Name == SystemTypes.PROJECT_FOLDER);
            Type = new PType(type);
        }

        public Guid SourceId { get; }
    }

    public class PType
    {
        public PType(INType type)
        {
            if (type == null)
                return;

            Id = type.Id;
            Name = type.Name;
            Title = type.Title;
            Sort = type.Sort;
            HasFiles = GetHasFiles(type);
            Kind = type.Kind;
            IsDeleted = type.IsDeleted;
            IsService = type.IsService;
            IsProject = type.IsProject;
            Children = type.Children;
            Attributes = type.Attributes;
            IsMountable = type.IsMountable;

            if (type.Icon != null)
                Icon = Convert.ToBase64String(type.Icon);
        }

        public int Id { get; }
        public string Name { get; }
        public string Title { get; }
        public int Sort { get; }
        public bool HasFiles { get; }
        public TypeKind Kind { get; }
        public bool IsDeleted { get; }
        public bool IsService { get; }
        public bool IsProject { get; }
        public IReadOnlyList<int> Children { get; }
        public IReadOnlyList<INAttribute> Attributes { get; }
        public string Icon { get; }
        public bool IsMountable { get; }

        private bool GetHasFiles(INType type)
        {
            if (type.Name == SystemTypes.PROJECT_FILE)
                return true;

            return type.HasFiles;
        }
    }
}
