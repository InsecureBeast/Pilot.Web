import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ToolbarItem } from '../../shared/toolbar.item';
import { IObject, AttributeType, ITransition } from 'src/app/core/data/data.classes';
import { RepositoryService } from 'src/app/core/repository.service';
import { IObjectExtensions } from 'src/app/core/tools/iobject.extensions';
import { TransitionsManager } from 'src/app/core/transitions/transitions.manager';
import { TransitionCommand } from '../../shared/transition.command';
import { RequestType } from 'src/app/core/headers.provider';

@Component({
    selector: 'app-task-toolbar',
    templateUrl: './task-toolbar.component.html',
  styleUrls: ['./task-toolbar.component.css', '../../../ui/toolbar.css']
})
/** task-toolbar component*/
export class TaskToolbarComponent {
  
  //private _task: IObject;

  toolbarItems : ToolbarItem[];
  requestState = RequestState.None;

  @Input()
  set task(value: IObject) {
    //this._task = value;
    this.loadToolbar(value);
  }
  
  @Output() onClosed = new EventEmitter<any>();
  @Output() onTransition = new EventEmitter<TransitionCommand>();

  /** task-toolbar ctor */
  constructor(private readonly repository: RepositoryService, 
    private readonly transitionsManager: TransitionsManager,
    private readonly sanitizer: DomSanitizer) {
    
  }

  close($event): void {
    this.onClosed.emit($event);
  }

  onTransitionClick($event: ToolbarItem): void {
    if (this.requestState === RequestState.Run)
      return;

    $event.event.emit($event.source);
  }
  
  loadToolbar(value: IObject) {
    this.toolbarItems = new Array<ToolbarItem>();
    if (!value)
      return;
    
    const userStatesAttrs = value.type.attributes.filter(x => x.type === AttributeType.UserState);
    const currentPerson = this.repository.getCurrentPerson();
    for (const stateAttr of userStatesAttrs) {
      const attrsMap = IObjectExtensions.objectAttributesToMap(value.attributes);
      const transitions = this.transitionsManager.getAvailableTransitions(stateAttr, attrsMap, currentPerson);
      
      transitions.forEach(t => {
        const transitionCommand = new TransitionCommand();
        transitionCommand.attrName = stateAttr.name;
        transitionCommand.transition = t; 
        this.addTransitionToolbarItem(transitionCommand)});
    }
  }

  setRequestState(state: RequestState): void {
    this.requestState = state;
  }

  private addTransitionToolbarItem(transitionCommand: TransitionCommand): void {
    if (!transitionCommand.transition.displayName || transitionCommand.transition.displayName === "")
      return;
    
    var stateTo = this.repository.getUserState(transitionCommand.transition.stateTo);
    const toolbarItem = new ToolbarItem(transitionCommand.transition.displayName, stateTo.icon, transitionCommand, this.sanitizer);
    toolbarItem.event = this.onTransition;
    this.toolbarItems.push(toolbarItem);
  }
}

export enum RequestState {
  None = 0,
  Run = 1,
  End = 2,
  Error = 3
}
