using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pilot.Web.Model
{
    public static class FieldNames
    {
        public const string ID = "DObject.Id";
        public const string TYPE_ID = "DObject.TypeId";
        public const string PARENT_ID = "DObject.ParentId";
        public const string CREATOR_ID = "DObject.CreatorId";
        public const string CREATED = "DObject.Created";
        public const string IS_SECRET = "DObject.IsSecret";
        public const string IS_DELETED = "DObject.IsDeleted";
        public const string IS_IN_RECYCLE_BIN = "DObject.IsInRecycleBin";
        public const string ALL_TEXT = "DObject.AllText";
        public const string ALL_SNAPSHOTS_REASON = "Dobject.SnapshotsReason";
        public const string SNAPSHOTS_CREATED = "Dobject.SnapshotsCreated";
        public const string OBJECT_STATE = "DObject.State.State";
        public const string STATE_PERSON_ID = "DObject.State.PersonId";
        public const string STATE_DATE = "DObject.State.Date";
        public const string STATE_POSITION = "DObject.State.PositionId";
        public const string CONTEXT = "DObject.Context";
        public const string LEVEL = "DObject.Level";
    }

    public static class FileFieldNames
    {
        public const string CONTENT = "content";
        public const string CREATED = "creation";
        public const string MODIFIED = "modified";
    }
}
