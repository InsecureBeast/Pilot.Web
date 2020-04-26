import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";

import { IObject, IType, IUserState, OrgUnitKind, RelationType, IOrganizationUnit, UserStateColors } from "src/app/core/data/data.classes";
import { RepositoryService } from "src/app/core/repository.service";
import { SystemTaskAttributes } from "src/app/core/data/system.types";
import { Tools } from "src/app/core/tools/tools";
import { TypeExtensions } from "src/app/core/tools/type.extensions";

export class TaskNode {

  constructor(source: IObject,
    private readonly sanitizer: DomSanitizer,
    private readonly repository: RepositoryService,
    private readonly translate: TranslateService) {

    this.title = source.title;
    this.type = source.type;
    this.icon = Tools.getSvgImage(source.type.icon, sanitizer);
    this.setTaskData(source);
    this.id = source.id;
    this.parentId = source.parentId;

  }

  id: string;
  parentId: string;
  title: string;
  type: IType;
  icon: SafeUrl;
  userState: UserState;
  intent: number;
  isInWorkflow: boolean;
  attachments: any;
  isSelected = false;
  attributes: Map<string, any>;
  dateOfAssignment: string;
  deadline: string;
  initiator: string;
  executor: string;
  isTask: boolean;
  isOutdated: boolean;

  private getOrgUnit(source: IObject, attrName: string): IOrganizationUnit {

    const value = source.attributes[attrName];
    const positions = value as Array<number>;
    if (!positions) {
      return null;
    }

    const position = positions[0];
    return this.repository.getOrganizationUnit(position);
  }

  private getPersonTitle(source: IObject, attrName: string): string {
    const currentPerson = this.repository.getCurrentPerson();
    const position = this.getOrgUnit(source, attrName);
    if (position) {
      if (position.kind === OrgUnitKind.Position) {
        const person = this.repository.getPerson(position.person);
        if (person) {
          if (person.id === currentPerson.id)
            return this.translate.instant("you");
          else
            return person.displayName;
        }
      } else {
        return position.title;
      }
    }
  }

  private getDateString(source: IObject, attributeName: string): string {
    const value = source.attributes[attributeName];
    const date = value as string;
    if (!date) {
      return null;
    }

    return date;
  }

  private getState(source: IObject, repository: RepositoryService): IUserState {
    const value = source.attributes[SystemTaskAttributes.STATE];
    const stateStringId = value as string;
    if (!stateStringId) {
      return null;
    }

    return repository.getUserState(stateStringId);
  }

  private setTaskData(source: IObject): void {

    this.executor = this.getPersonTitle(source, SystemTaskAttributes.EXECUTOR_POSITION);
    this.initiator = this.getPersonTitle(source, SystemTaskAttributes.INITIATOR_POSITION);
    const dateAttrString = this.getDateString(source, SystemTaskAttributes.DATE_OF_ASSIGNMENT);
    if (dateAttrString) {
      this.dateOfAssignment = Tools.toLocalDateTime(dateAttrString, this.translate.currentLang);
    }
    this.isTask = TypeExtensions.isTask(source.type);
    const state = this.getState(source, this.repository);
    if (state)
      this.userState = new UserState(state, this.sanitizer);

    this.isInWorkflow = !this.isTask || source.context.length > 1;
    this.attachments = source.relations.filter(r => r.type === RelationType.TaskAttachments);
    this.attributes = new Map(Object.entries(source.attributes));

    const deadlineAttrString = this.getDateString(source, SystemTaskAttributes.DEADLINE_DATE);
    if (deadlineAttrString) {
      this.deadline = Tools.toLocalDateTime(deadlineAttrString, this.translate.currentLang);
      const deadlineDate = Tools.toUtcCsDateTime(dateAttrString);
      this.isOutdated = deadlineDate.getDate() < Date.now();
    }
    
  }
}

export class TaskWorkflowNode extends TaskNode {

  constructor(source: IObject,
    sanitizer: DomSanitizer,
    repository: RepositoryService,
    translate: TranslateService) {
    super(source, sanitizer, repository, translate);
  }
}

export class UserState {

  constructor(state: IUserState, sanitizer: DomSanitizer) {
    this.id = state.id;
    this.name = state.name;
    this.title = state.title;
    this.color = state.color;
    this.isDeleted = state.isDeleted;
    this.isCompletionState = state.isCompletionState;
    this.isSystemState = state.isSystemState;
    this.icon = Tools.getSvgImage(state.icon, sanitizer);
  }

  id: string;
  name: string;
  title: string;
  icon: SafeUrl;
  color: UserStateColors;
  isDeleted: boolean;
  isCompletionState: boolean;
  isSystemState: boolean;
}
