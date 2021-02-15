import { IChild, IObject, IType } from 'src/app/core/data/data.classes';

export function randomIObject(id: string): IObject {
    const type = <IType> {
        id: 2,
        children: [],
        attributes: []
    };
    const object = <IObject> {
        id: id,
        type: type,
        children: [],
        created: '',
    };
    return object;
}

export function createIChildStub(objectId: string, typeId: number): IChild {
    const child = <IChild> {
        objectId: objectId,
        typeId: typeId
    };

    return child;
}
