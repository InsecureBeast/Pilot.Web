import { SystemStates } from "../data/system.states"
import { IValue, AccessLevel } from "../data/data.classes"

export class IObjectExtensions {
    
  static getStateValue(attributes: Map<string, any>, attributeName: string) : string  {
    if (attributes == null)
        return SystemStates.NONE_STATE_ID;

    if (attributes.has(attributeName)){
        const value = attributes.get(attributeName);
        if (!value)
          return SystemStates.NONE_STATE_ID;
        else
          return value;
    }

    return SystemStates.NONE_STATE_ID;
  }

  static objectAttributesToMap(attributes: { [key: string]: any; }): Map<string, IValue> {
    const map = new Map<string, IValue>();
    Object.keys(attributes).forEach(key => {
      map.set(key, attributes[key]);
    });
    return map;
  }

  static objectToMap<T>(objectMap: { [key: string]: any; }): Map<string, T> {
    const map = new Map<string, T>();
    Object.keys(objectMap).forEach(key => {
      map.set(key, objectMap[key]);
    });
    return map;
  }

  static hasAccess(accessLevel: AccessLevel, level: AccessLevel): boolean {
    return (accessLevel & level) === level;
  }
}
