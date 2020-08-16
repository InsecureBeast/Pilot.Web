import { Component, Input } from '@angular/core';
import { ObjectNode } from 'src/app/documents/shared/object.node';
import { UserState, UserStateColorService } from 'src/app/core/data/user.state';
import { RepositoryService } from 'src/app/core/repository.service';
import { AttributeType } from 'src/app/core/data/data.classes';
import { TypeIconService } from 'src/app/core/type-icon.service';
import { NodeStyle } from 'src/app/core/node-style.service';
import { SystemStates } from 'src/app/core/data/system.states';

@Component({
    selector: 'app-user-state',
    templateUrl: './user-state.component.html',
    styleUrls: ['./user-state.component.css']
})
/** user-state component*/
export class UserStateComponent {
  
  private _node: ObjectNode;

  userStates: UserState[];

  @Input()
  set node(node: ObjectNode) {
    this._node = node;
    this.loadUserStates(node);
  }

  @Input() style: NodeStyle;
  
  /** user-state ctor */
  constructor(
    private readonly repository: RepositoryService,
    private typeIconService: TypeIconService,
    private userStateColorService: UserStateColorService ) {

  }

  private loadUserStates(node: ObjectNode) : void {
    this.userStates = new Array<UserState>();

    if (!node)
      return;
    
    const stateAttrs = node.source.type.attributes.filter(at => at.type === AttributeType.UserState);
    for (const attr of stateAttrs) {
      const value = node.source.attributes[attr.name];
      if (!value)
        continue;
  
      const state = this.repository.getUserState(value);
      if (!state)
        continue;

      const userState = new UserState(state, this.typeIconService, this.userStateColorService);
      if (userState.id === SystemStates.NONE_STATE_ID)
        continue;
        
      this.userStates.push(userState);
    }
  }
}
