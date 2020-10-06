import { Injectable } from "@angular/core";
import { AccessLevel, IObject, IPerson, ObjectState, Access, AccessRecord } from "../data/data.classes";

@Injectable({ providedIn: 'root' })
export class ObjectSecurityService {
    
    getAccessByPerson(obj: IObject, person: IPerson) : AccessLevel
    {
        if (obj == null)
            return AccessLevel.None;
        if (person == null)
            return AccessLevel.None;

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