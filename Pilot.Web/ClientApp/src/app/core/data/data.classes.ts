import { OnInit } from "@angular/core";

export class DatabaseInfo {

  metadataVersion: number;
  lastChangeset;
  person;
  databaseId
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
  attributes: Map<string, any>;
  children: IChild[];
  creator: IPerson;
  created: string;
  actualFileSnapshot: IFileSnapshot;
  previousFileSnapshots: IFileSnapshot[];
  context: string[];
  relations: IRelation[];
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

export enum OrgUnitKind
{
    Department = 0,
    Position = 1,
    Group = 2
}

export interface IFile {
  body: IFileBody;
  name: string;
  signatures: any;
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
