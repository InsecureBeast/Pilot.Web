import { Change, AttributeChangeValue } from "./change";

export class ObjectBuilder{
    private change: Change;
    
    constructor(objectId: string) {
        this.change = new Change(objectId);
    }

    setAttribute(name: string, value: any): ObjectBuilder {
        this.change.attributes.changed.push(new AttributeChangeValue(name, value));
        return this;
    }

    removeAttribute(name: string, value: any): ObjectBuilder {
        this.change.attributes.removed.push(new AttributeChangeValue(name, value));
        return this;
    }

    getChange() : Change {
        return this.change;
    }
}