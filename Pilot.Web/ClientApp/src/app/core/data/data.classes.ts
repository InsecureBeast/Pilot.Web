import { IObjectExtensions } from '../tools/iobject.extensions';

export interface IDatabaseInfo {

  metadataVersion: number;
  lastChangeset;
  person;
  databaseId: string;
  databaseVersion: number;
  people;
  organizationUnits;
}

export interface IMetadata {
  version: number;
  types;
  userStates;
  stateMachines;
}

export interface IObject {
  id: string;
  parentId: string;
  title: string;
  type: IType;
  attributes: { [key: string]: any; };// Map<string, IValue>;
  children: IChild[];
  creator: IPerson;
  created: string;
  actualFileSnapshot: IFileSnapshot;
  previousFileSnapshots: IFileSnapshot[];
  context: string[];
  relations: IRelation[];
  access: AccessRecord[];
  stateInfo: StateInfo;
}

export interface IType {
  id: number;
  title: string;
  name: string;
  icon: string;
  sort: number;
  hasFiles: boolean;
  children: number[];
  attributes: IAttribute[];
  isDeleted: boolean;
  kind: number;
  isMountable: boolean;
  isService: boolean;
  isProject: boolean;
}

export interface IValue {
  value: any;
  strValue: string;
  intValue: number;
  doubleValue: number;
  dateValue: Date;
  arrayValue: string[];
  decimalValue: number;
}

export interface IAttribute {
  name: string;
  title: string;
  obligatory: boolean;
  type: AttributeType;
  displayHeight: number;
  showInTree: boolean;
  displaySortOrder: number;
  isService: boolean;
  configuration: string;
  inGroup: boolean;
  isUnique: boolean;
}

export enum AttributeType {
  Integer = 0,
  Double = 1,
  DateTime = 2,
  String = 3,
  Decimal = 4,
  Numerator = 5,
  Array = 6,
  UserState = 7,
  OrgUnit = 8,
}

export interface IPerson {
  id: number;
  login: string;
  isInactive: boolean;
  displayName: string;
  positions: number[];
  groups: number[];
  bossOf: number[];
  allOrgUnits: number[];
  comment: string;
  email: string;
  sid: string;
  uidDn: string;
  isDeleted: boolean;
  isAdmin: boolean;
  version: number;
}

export interface IOrganizationUnit {
  id: number;
  title: string;
  kind: OrgUnitKind;
  children: number[];
  isDeleted: boolean;
  isBoss: boolean;
  version: number;
  person: number;
  vicePersons: number[];
  isCanceled: boolean;
  groupPersons: number[];
}

export enum OrgUnitKind {
  Department = 0,
  Position = 1,
  Group = 2
}

export interface ISignature {
  id: string;
  databaseId: string;
  positionId: number;
  role: string;
  sign: string;
  requestedSigner: string;
  isAdditional: boolean;
  objectId: string;
}

export interface IFile {
  body: IFileBody;
  name: string;
  signatures: ISignature[];
}

export interface IFileSnapshot {
  created: string;
  creatorId: number;
  reason: string;
  files: IFile[];
}

export interface IFileBody {
  id: string;
  size: number;
  md5: any;
  modified: Date;
  created: Date;
  accessed: Date;
}

export interface IChild {
  objectId: string;
  typeId: number;
}

export interface ICommonSettings {
  personal: string;
  common;
}

export interface IUserState {
  id: string;
  name: string;
  title: string;
  icon: string;
  color: UserStateColors;
  isDeleted: boolean;
  isCompletionState: boolean;
  isSystemState: boolean;
}

export enum UserStateColors {
  None = 0,
  Color1 = 1,
  Color2 = 2,
  Color3 = 3,
  Color4 = 4,
  Color5 = 5,
  Color6 = 6,
  Color7 = 7
}

export interface IRelation {
  id: string;
  targetId: string;
  type: RelationType;
  name: string;
  versionId: Date;
}

export enum RelationType {
  SourceFiles = 1,
  TaskInitiatorAttachments = 2,
  TaskExecutorAttachments = 3,
  MessageAttachments = 4,
  Custom = 5,
  TaskAttachments = 6,
}

export interface ITransition {
  stateTo: string;
  displayName: string;
  availableForPositionsSource: string[];
}

export interface IUserStateMachine {
  id: string;
  title: string;
  stateTransitions: Map<string, ITransition[]>;
}

export class MUserStateMachine {
  static readonly Null: IUserStateMachine = {
    id : '',
    title: '',
    stateTransitions: new Map<string, ITransition[]>()
  };

  constructor(stateMachine: IUserStateMachine) {
    this.id = stateMachine.id;
    this.title = stateMachine.title;
    this.stateTransitions = IObjectExtensions.objectToMap<ITransition[]>(stateMachine.stateTransitions);
  }

  id: string;
  title: string;
  stateTransitions: Map<string, ITransition[]>;
}

export enum AccessLevel {
  None = 0,
  Create = 1 << 0,
  Edit = 1 << 1,
  View = 1 << 2,
  Freeze = 1 << 3,
  Agreement = 1 << 4,

  ViewCreate = View | Create,
  ViewEdit = View | Create | Edit,
  ViewEditAgrement = ViewEdit | Agreement,
  Full = View | Create | Edit | Freeze | Agreement
}

export class AccessRecord {
  static readonly Empty: AccessRecord;
  RECORD_OWNER_UNDEFINED = 0;

  orgUnitId: number;
  access: Access;
  recordOwnerPosition: number;
  inheritanceSource: string;

  equals(other: AccessRecord): boolean {
    if (this.orgUnitId === other.orgUnitId &&
      (this.access.Equals(other.access) &&
      this.recordOwnerPosition === other.recordOwnerPosition)) {
      return this.inheritanceSource === other.inheritanceSource;
    }
    return false;
  }

  // isTwinTo(other: AccessRecord): boolean
  // {
  //   if (this.orgUnitId === other.orgUnitId && this.recordOwnerPosition === other.recordOwnerPosition)
  //     return object.Equals((object) this.Access, (object) other.Access);
  //   return false;
  // }
}

export class Access {
  accessLevel: AccessLevel;
  validThrough: Date;
  isInheritable: boolean;

  Equals(other: Access ) {
    return this.accessLevel === other.accessLevel &&
          this.isInheritable === other.isInheritable &&
          this.validThrough === other.validThrough;
  }
}

export enum ObjectState {
    Alive,
    InRecycleBin,
    DeletedPermanently,
    Frozen,
    LockRequested,
    LockAccepted
}

export class StateInfo {
  constructor() {
    this.state = ObjectState.Alive;
  }

  state: ObjectState;
  date: Date;
  personId: number;
  positionId: number;
}

export interface IXpsDigitalSignature {
  id: string;
  signer: string;
  signDate: string;
  isCertificateValid: boolean;
  isSigned: boolean;
  isValid: boolean;
  isAdditional: boolean;
  role: string;
  canUserSign: boolean;s
}
