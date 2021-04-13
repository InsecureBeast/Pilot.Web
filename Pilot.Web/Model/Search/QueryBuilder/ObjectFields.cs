using System;
using Ascon.Pilot.DataClasses;
using Pilot.Web.Model.Search.QueryBuilder.Fields;

namespace Pilot.Web.Model.Search.QueryBuilder
{
    public class ObjectFields
    {
        public static GuidField Id => new GuidField(FieldNames.ID);

        public static GuidField ParentId => new GuidField(FieldNames.PARENT_ID);

        public static Int32Field TypeId => new Int32Field(FieldNames.TYPE_ID);

        public static Int32Field CreatorId => new Int32Field(FieldNames.CREATOR_ID);

        public static DateTimeField CreatedDate => new DateTimeField(FieldNames.CREATED);

        public static BoolField IsSecret => new BoolAsInt32Field(FieldNames.IS_SECRET);

        public static EnumField<ObjectState> ObjectState => new EnumAsInt32Field<ObjectState>(FieldNames.OBJECT_STATE);

        public static Int32Field StateChangedPersonId => new Int32Field(FieldNames.STATE_PERSON_ID);

        public static StringField AllText => new StringField(FieldNames.ALL_TEXT);

        public static StringField AllSnapshotsReason => new StringField(FieldNames.ALL_SNAPSHOTS_REASON);

        public static DateTimeField SnapshotsCreated => new DateTimeField(FieldNames.SNAPSHOTS_CREATED);

        public static GuidField Context => new GuidField(FieldNames.CONTEXT);

        public static Int32Field SignatureAwaitingBy => new Int32Field(FieldNames.SIGN_AWAITING_POSITIONS);
        public static Int32Field SignedBy => new Int32Field(FieldNames.SIGNED_POSITIONS);
    }
}
