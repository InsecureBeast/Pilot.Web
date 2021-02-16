import { AccessLevel, IObject, IPerson, ObjectState } from "../data/data.classes";
import { Injectable } from "@angular/core";
import { RepositoryService } from "../repository.service";
import { ObjectSecurityService } from "./object-security.service";

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
