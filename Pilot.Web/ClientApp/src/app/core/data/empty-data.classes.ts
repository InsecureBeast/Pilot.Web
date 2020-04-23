import { IType, IAttribute, IObject, IChild, IPerson, IFileSnapshot, IRelation, IFile } from './data.classes';

export class EmptyType implements IType {

  constructor() {
    this.id = -1;
    this.title = "";
    this.name = "";
    this.icon = null;
    this.sort = -1;
    this.children = new Array();
    this.attributes = new Array();
    this.kind = -1;
  }

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

export class EmptyObject implements IObject {
  constructor() {
    this.id = "";
    this.parentId = "";
    this.title = "";
    this.type = new EmptyType();
    this.attributes = new Map();
    this.children = new Array();
    this.creator = new EmptyPerson();
    this.created = "";
    this.actualFileSnapshot = new EmptyFileSnapshot();
    this.previousFileSnapshots = new Array();
    this.context = new Array();
    this.relations = new Array();
  }

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

export class EmptyPerson implements IPerson {

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

export class EmptyFileSnapshot implements IFileSnapshot {
  created: string;
  creatorId: number;
  reason: string;
  files: IFile[];
}
