import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, NavigationStart, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';

import { Subscription, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { IAttribute, AttributeType, IOrganizationUnit, IPerson, OrgUnitKind, IObject, RelationType } from '../../../core/data/data.classes';
import { Tools } from '../../../core/tools/tools';
import { RepositoryService } from '../../../core/repository.service';
import { SystemTaskAttributes } from '../../../core/data/system.types';
import { TypeIconService } from '../../../core/type-icon.service';

@Component({
    selector: 'app-task-details',
    templateUrl: './task-details.component.html',
    styleUrls: ['./task-details.component.css']
})
/** task-details component*/
export class TaskDetailsComponent implements OnInit, OnDestroy {
  error;

  //private navigationSubscription: Subscription;
  private _task: IObject;

  @Input()
  set task(value: IObject) {
    this._task = value;
    this.loadTask(value);
  }

  taskTypeIcon: SafeUrl;
  taskTypeTitle: string;

  initiator: AttributeItem;
  executor: AttributeItem;
  attributes: AttributeItem[];

  isLoading: boolean;
  hasAttachments: boolean;

  /** task ctor */
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly repository: RepositoryService,
    private readonly translate: TranslateService,
    private readonly iconService: TypeIconService) {

  }

  ngOnInit(): void {

    //this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
    //  const id = params.get('id');

    //  this.repository.getObjectAsync(id)
    //    .then(source => {
          
    //    })
    //    .catch(err => {
    //      this.error = err;
    //      this.isLoading = false;
    //    });
    //});
  }

  ngOnDestroy(): void {
    //this.navigationSubscription.unsubscribe();
    //this.routerSubscription.unsubscribe();

    // cancel
    //this.ngUnsubscribe.next();
    //this.ngUnsubscribe.complete();
  }

  private loadTask(source: IObject): void {
    this.taskTypeIcon = this.iconService.getTypeIcon(source);
    this.taskTypeTitle = source.type.title;

    this.attributes = new Array<AttributeItem>();
    this.executor = null;
    this.initiator = null;

    const type = source.type;

    const relations = source.relations.filter(r => r.type === RelationType.TaskAttachments);
    this.hasAttachments = relations.length > 0;

    const sortedAttributes = type.attributes.sort((a, b) => a.displaySortOrder - b.displaySortOrder);
    for (let typeAttr of sortedAttributes) {
      const value = source.attributes[typeAttr.name];

      if (typeAttr.name === SystemTaskAttributes.EXECUTOR_POSITION) {
        const orgUnits = this.getOrgUnits(value);
        this.executor = new OrgUnitAttributeItem(typeAttr, orgUnits, this.repository);
        continue;
      }

      if (typeAttr.name === SystemTaskAttributes.INITIATOR_POSITION) {
        const orgUnits = this.getOrgUnits(value);
        this.initiator = new OrgUnitAttributeItem(typeAttr, orgUnits, this.repository);
        continue;
      }

      if (typeAttr.isService)
        continue;

      if (typeAttr.type === AttributeType.DateTime) {
        const dateItem = new DateAttributeItem(typeAttr, value, this.translate.currentLang);
        this.attributes.push(dateItem);
        continue;
      }

      if (typeAttr.type === AttributeType.OrgUnit) {
        const orgUnits = this.getOrgUnits(value);
        const orgUnitItem = new OrgUnitAttributeItem(typeAttr, orgUnits, this.repository);
        this.attributes.push(orgUnitItem);
        continue;
      }

      const item = new StringAttributeItem(typeAttr, value);
      this.attributes.push(item);
    }
  }

  private getOrgUnits(positions: number[]): IOrganizationUnit[] {

    const result = new Array<IOrganizationUnit>();
    if (!positions) {
      return result;
    }

    for (let pos of positions) {
      const orgUnit = this.repository.getOrganizationUnit(pos);
      result.push(orgUnit);
    }

    return result;
  }


}

export class AttributeItem {

  protected attribute: IAttribute;

  constructor(attribute: IAttribute) {
    this.attribute = attribute;
    this.title = attribute.title;
    this.type = attribute.type;
  }

  title: string;
  type: AttributeType;
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
    if (value === "9999-12-31T23:59:59.9999999")
      return;

    this.value = Tools.toLocalDateTime(value, currentLang);
  }

  value: string;
}

export class OrgUnitAttributeItem extends AttributeItem {

  constructor(attribute: IAttribute, orgUnits: IOrganizationUnit[], repository: RepositoryService) {
    super(attribute);

    this.items = new Map<IPerson, IOrganizationUnit>();
    for (let orgUnit of orgUnits) {
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
