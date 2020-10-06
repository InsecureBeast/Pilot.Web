import { AccessLevel, IObject, IPerson, ObjectState, Access, AccessRecord } from "../data/data.classes";
import { Injectable } from "@angular/core";
import { RepositoryService } from "../repository.service";

@Injectable({ providedIn: 'root' })
export class AccessCalculator {
    constructor(private readonly repository: RepositoryService,
        private readonly objectSecurity: ObjectSecurityService) {
        
    }

    calcAccess(node: IObject) : AccessLevel
    {
        var currentPerson = this.repository.getCurrentPerson();
        return this.calcAccessForPerson(node, currentPerson);
    }

    calcAccessForPerson(node: IObject, person: IPerson) : AccessLevel {
        if (!person)
            return AccessLevel.None;

        let access = this.objectSecurity.getAccessByPerson(node, person);

        if(node.stateInfo.state == ObjectState.InRecycleBin)
            access-= AccessLevel.Edit;

        if (node.stateInfo.state == ObjectState.Frozen)
        {
            let activeAccess = AccessLevel.None;
            if ((access & AccessLevel.View) === AccessLevel.View)
                activeAccess = AccessLevel.View;
            if ((access & AccessLevel.Freeze) === AccessLevel.Freeze)
                activeAccess |= AccessLevel.Freeze;
            return activeAccess;
        }
        return access;
    }
}

@Injectable({ providedIn: 'root' })
export class ObjectSecurityService {
    
    getAccessByPerson(obj: IObject, person: IPerson) : AccessLevel
    {
        if (obj == null)
            return ;//throw new exception("obj is undefined");
        if (person == null)
            return;
        //throw new exception("person is undefined");

        if (obj.stateInfo.state == ObjectState.DeletedPermanently)
            return AccessLevel.Full;

        if (person.isAdmin)
            return AccessLevel.Full;

        if (obj.stateInfo.state == ObjectState.InRecycleBin)
        {
            return person.positions.filter(x => x == obj.stateInfo.positionId).length > 0 ? AccessLevel.ViewEdit : AccessLevel.None;
        }

        if (person.isDeleted)
            return AccessLevel.None;

        let result = AccessLevel.None;
        const effectiveRecords = this.getEffectiveRecords(obj.access, person);
        effectiveRecords.forEach(record => {
            result |= record.access.accessLevel;
        });
        
        return result;
    }

    private getEffectiveRecords(records: Array<AccessRecord>, person: IPerson) : AccessRecord[]
    {
        return records.filter(x => person.allOrgUnits.includes(x.orgUnitId) && !this.isExpired(x.access));
    }

    private isExpired(access: Access): boolean
    {
        return access.validThrough.valueOf() < Date.now();
    }
}