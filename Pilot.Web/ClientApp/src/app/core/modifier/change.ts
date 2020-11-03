
export class Change {
    constructor(objectId: string) {
        this.attributes = new ChangesResult<AttributeChangeValue>();
        this.objectId = objectId;
    }
    objectId : string;
    attributes : ChangesResult<AttributeChangeValue>;
}

export class ChangesResult<T> {
    constructor() {
        //this.added = new Array<T>()
        this.removed = new Array<T>()
        this.changed = new Array<T>()
    }

    //added: T[];
    removed: T[];
    changed: T[];
}

export class AttributeChangeValue {
    constructor(name: string, value: any) {
        this.name = name;
        this.value = value;
    }
    name: string;
    value: any;
}