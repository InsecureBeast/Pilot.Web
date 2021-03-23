import { IAttribute, AttributeType, IOrganizationUnit, IPerson, OrgUnitKind, IObject } from '../data/data.classes';
import { Tools } from '../tools/tools';
import { RepositoryService } from '../repository.service';
import { UserState, UserStateColorService } from '../data/user.state';
import { TransitionsManager } from '../transitions/transitions.manager';
import { IObjectExtensions } from '../tools/iobject.extensions';
import { TypeIconService } from '../type-icon.service';
import { SafeUrl } from '@angular/platform-browser';
import { SystemStates } from '../data/system.states';

export class AttributeItem {

  protected attribute: IAttribute;

  constructor(attribute: IAttribute) {
    this.attribute = attribute;
    this.title = attribute.title;
    this.type = attribute.type;
    this.name = attribute.name;
    this.displayHeight = attribute.displayHeight;
  }

  title: string;
  type: AttributeType;
  name: string;
  displayHeight: number;
}

export class StringAttributeItem extends AttributeItem {

  constructor(attribute: IAttribute, value: string) {
    super(attribute);
    this.value = value;
  }

  value: string;
}

export class DateAttributeItem extends AttributeItem {

  constructor(attribute: IAttribute, value: string, currentLang: string) {
    super(attribute);
    if (value === '9999-12-31T23:59:59.9999999') {
      return;
    }

    if (value === '9999-12-31T20:59:59.9999999') {
      return;
    }

    this.value = Tools.toLocalDateTime(value, currentLang);
  }

  value: string;
}

export class OrgUnitAttributeItem extends AttributeItem {

  constructor(attribute: IAttribute, orgUnits: IOrganizationUnit[], repository: RepositoryService) {
    super(attribute);

    this.items = new Map<IPerson, IOrganizationUnit>();
    for (const orgUnit of orgUnits) {
      if (orgUnit.kind !== OrgUnitKind.Position) {
        this.items.set(null, orgUnit);
        continue;
      }

      const person = repository.getPerson(orgUnit.person);
      this.items.set(person, orgUnit);
    }
  }

  items: Map<IPerson, IOrganizationUnit>;
}

export class StateAttributeItem extends AttributeItem {

  constructor(
    source: IObject,
    attribute: IAttribute,
    strValue: string,
    repository: RepositoryService,
    transitionsManager: TransitionsManager,
    typeIconService: TypeIconService,
    userStateColorService: UserStateColorService) {
    super(attribute);

    this.options = new Array<UserState>();

    let currentState = repository.getUserState(strValue);
    if (!currentState) {
      currentState = repository.getUserState(SystemStates.NONE_STATE_ID);
    }

    //if (currentState.id === SystemStates.NONE_STATE_ID && !attribute.obligatory) {
    //  const currentUserState = new UserState(currentState, typeIconService, userStateColorService);
    //  this.options.push(currentUserState);
    //}

    this.value = new UserState(currentState, typeIconService, userStateColorService);
    this.options.push(this.value);

    const currentPerson = repository.getCurrentPerson();
    const attrsMap = IObjectExtensions.objectAttributesToMap(source.attributes);
    const transitions = transitionsManager.getAvailableTransitions(attribute, attrsMap, currentPerson);
    for (const transition of transitions) {
      const state = repository.getUserState(transition.stateTo);
      if (!state) {
        continue;
      }
      const userState = new UserState(state, typeIconService, userStateColorService);
      this.options.push(userState);
    }
  }

  value: UserState;
  options: UserState[];
}

export class UserStateOption {
  constructor(userState: UserState) {
    this.id = userState.id;
    this.title = userState.title;
    this.icon = userState.icon;
  }

  id: string;
  icon: SafeUrl;
  title: string;
  selected: boolean;
}
