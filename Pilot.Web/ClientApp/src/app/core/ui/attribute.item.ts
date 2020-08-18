import { IAttribute, AttributeType, IOrganizationUnit, IPerson, OrgUnitKind } from "../data/data.classes";
import { Tools } from "../tools/tools";
import { RepositoryService } from "../repository.service";

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