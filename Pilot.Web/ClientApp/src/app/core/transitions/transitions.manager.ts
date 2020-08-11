import { Injectable } from '@angular/core';
import { Guid } from "guid-typescript";

import { ITransitionsManager } from "./transitions-manager.interface"
import { IAttribute, IPerson, ITransition, IValue } from "../data/data.classes"
import { IObjectExtensions } from '../tools/iobject.extensions';
import { RepositoryService } from '../repository.service';
import { AttributePermissionInfo } from '../attribute-permission.info';

@Injectable({ providedIn: 'root' })
export class TransitionsManager implements ITransitionsManager {
    constructor(private readonly repository: RepositoryService) {

    }

    getAvailableTransitions(attribute: IAttribute, attributes: Map<string, IValue>, person: IPerson): ITransition[] {
        var currentStateId = IObjectExtensions.getStateValue(attributes, attribute.name);
        var allTransitions = this.getAllTransitions(currentStateId, attribute);
        return allTransitions.filter(t => this.isTransitionAvailable(t, attributes, person));
    }

    private getAllTransitions(stateFromId: string, attribute: IAttribute) : ITransition[] {
        
        const stateMachineId = attribute.configuration;
        if (!Guid.isGuid(stateMachineId))
            return new Array<ITransition>();

        var stateMachine = this.repository.getStateMachine(stateMachineId);
        if (!stateMachine)
            return new Array<ITransition>();;
        
        if (!stateMachine.stateTransitions)
            return new Array<ITransition>();

        if(stateMachine.stateTransitions.size == 0)
            return new Array<ITransition>();

        if (!stateMachine.stateTransitions.has(stateFromId))
            return new Array<ITransition>();

        const transitions = stateMachine.stateTransitions.get(stateFromId);
        return transitions;
    }

    private isTransitionAvailable(transition: ITransition,  attributes: Map<string, IValue>, person: IPerson): boolean {
        if (!transition.availableForPositionsSource || transition.availableForPositionsSource.length === 0)
            return true;

        var permissionsInfo = new AttributePermissionInfo(transition.availableForPositionsSource);
        return permissionsInfo.extractAllOrgUnitsByAttributes(attributes).filter(u => person.allOrgUnits.includes(u)).length !== 0; 
    }
}
