import { IObject, IValue } from "./data/data.classes";
import { IObjectExtensions } from "./tools/iobject.extensions";

export class AttributePermissionInfo {
  private ATTRIBUTE_NAME_MARKER = '&';
  constructor(editableForPositionsSource: string[]) {
    this.orgUnits = new Array<number>();
    this.orgUnitAttributes = new Array<string>();

    if (!editableForPositionsSource)
      return;

    editableForPositionsSource.forEach(str => {
      if (str.length > 0 && str[0] === this.ATTRIBUTE_NAME_MARKER) {
        this.orgUnitAttributes.push(str.substring(1));
      }
      else {
        const num = Number(str);
        if (!isNaN(num)) 
          this.orgUnits.push(num);
      }
    });
  }

  orgUnits: number[];
  orgUnitAttributes: string[];

  // PackToStringArray() : string[] {
  //     return this.OrgUnitAttributes.map(x => "{ATTRIBUTE_NAME_MARKER}" + x)
  //     .reduce((oua, ou) =>)
  //     //Union(OrgUnits.Select(x => x.ToString())).ToArray();
  // }

  extractAllOrgUnits(obj: IObject): number[] {
    const attrMap = IObjectExtensions.objectToMap<IValue>(obj.attributes);
    return this.extractAllOrgUnitsByAttributes(attrMap);
  }

  extractAllOrgUnitsByAttributes(attributes: Map<string, IValue>) : number[] {
      
    let result = new Array<number>();
    if (!this.orgUnitAttributes || !attributes  )
      return result;

    this.orgUnitAttributes.forEach(permissionAttributeName => {
      if (attributes.has(permissionAttributeName)){
        const value = attributes.get(permissionAttributeName);
        if (value && Array.isArray(value)){
          value.forEach(intValue => {
            result.push(intValue);
          });
        }
      }
    });

    return result;
  }
}
