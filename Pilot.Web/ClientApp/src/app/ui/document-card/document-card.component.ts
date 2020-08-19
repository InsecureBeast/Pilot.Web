import { Component, Input } from '@angular/core';
import { IObject, AttributeType, IOrganizationUnit, IAttribute, AccessLevel } from 'src/app/core/data/data.classes';
import { TypeIconService } from 'src/app/core/type-icon.service';
import { SafeUrl } from '@angular/platform-browser';
import { AttributeItem, DateAttributeItem, OrgUnitAttributeItem, StringAttributeItem, StateAttributeItem } from 'src/app/core/ui/attribute.item';
import { TranslateService } from '@ngx-translate/core';
import { RepositoryService } from 'src/app/core/repository.service';
import { TransitionsManager } from 'src/app/core/transitions/transitions.manager';
import { UserStateColorService } from 'src/app/core/data/user.state';
import { IObjectExtensions } from 'src/app/core/tools/iobject.extensions';
import { AccessCalculator } from 'src/app/core/tools/access.calculator';

@Component({
    selector: 'app-document-card',
    templateUrl: './document-card.component.html',
    styleUrls: ['./document-card.component.css']
})
/** document-card component*/
export class DocumentCardComponent {

  typeIcon: SafeUrl;
  typeTitle: string;
  attributes: AttributeItem[];

  @Input()
  set document(value: IObject) {
    if (!value)
      return;
    this.loadObject(value);
  }

  @Input() isReadonly: boolean;
  
  /** document-card ctor */
  constructor(
      private readonly iconService: TypeIconService,
      private readonly translate: TranslateService,
      private readonly repository: RepositoryService,
      private readonly transitionManager: TransitionsManager,
      private readonly userStateColorService: UserStateColorService,
      private readonly typeIconService: TypeIconService) {

  }

  private loadObject(source: IObject): void {
    if (!source)
      return;

    this.typeIcon = this.iconService.getTypeIcon(source);
    this.typeTitle = source.type.title;
    this.attributes = new Array<AttributeItem>();
    const sortedAttributes = source.type.attributes.sort((a, b) => a.displaySortOrder - b.displaySortOrder);
    for (let typeAttr of sortedAttributes) {
      const value = source.attributes[typeAttr.name];

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

      if (typeAttr.type === AttributeType.UserState) {
        const stateItem = new StateAttributeItem(source, typeAttr, value, this.repository, this.transitionManager, this.typeIconService, this.userStateColorService);
        this.attributes.push(stateItem);
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