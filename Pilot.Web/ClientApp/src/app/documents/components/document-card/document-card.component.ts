import { Component, Input } from '@angular/core';
import { IObject, AttributeType, IOrganizationUnit } from 'src/app/core/data/data.classes';
import { TypeIconService } from 'src/app/core/type-icon.service';
import { SafeUrl } from '@angular/platform-browser';
import { AttributeItem, DateAttributeItem, OrgUnitAttributeItem, StringAttributeItem } from 'src/app/core/ui/attribute.item';
import { TranslateService } from '@ngx-translate/core';
import { RepositoryService } from 'src/app/core/repository.service';

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

  //private _task: IObject;

  @Input()
  set document(value: IObject) {
    //this._task = value;
    this.loadObject(value);
  }
  
  /** document-card ctor */
  constructor(
      private iconService: TypeIconService,
      private translate: TranslateService,
      private repository: RepositoryService) {

  }

  loadObject(source: IObject): void {
    if (!source)
      return;

    this.typeIcon = this.iconService.getTypeIcon(source);
    this.typeTitle = source.type.title;

    this.attributes = new Array<AttributeItem>();
    const sortedAttributes = source.type.attributes.sort((a, b) => a.displaySortOrder - b.displaySortOrder);
    for (let typeAttr of sortedAttributes) {
      const value = source.attributes[typeAttr.name];

    //   if (typeAttr.name == "state"){
    //     if (!Guid.isGuid(value))
    //       continue;
        
    //     var state = this.repository.getUserState(value);
    //     this.stateIcon = this.iconService.getSvgIcon(state.icon);
    //     this.stateTitle = state.title;
    //   }

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