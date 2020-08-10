import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { ToolbarItem } from '../../shared/toolbar.item';
import { IObject, AttributeType, ITransition } from 'src/app/core/data/data.classes';
import { RepositoryService } from 'src/app/core/repository.service';
import { IObjectExtensions } from 'src/app/core/tools/iobject.extensions';
import { TransitionsManager } from 'src/app/core/transitions/transitions.manager';

@Component({
    selector: 'app-task-toolbar',
    templateUrl: './task-toolbar.component.html',
  styleUrls: ['./task-toolbar.component.css', '../../../documents/shared/toolbar.css']
})
/** task-toolbar component*/
export class TaskToolbarComponent {
  //private _task: IObject;

  toolbarItems : ToolbarItem[];

  @Input()
  set task(value: IObject) {
    //this._task = value;
    this.loadToolbar(value);
  }
  
  @Output() onDocumentClosed = new EventEmitter<any>();

  /** task-toolbar ctor */
  constructor(private readonly repository: RepositoryService, 
    private readonly transitionsManager: TransitionsManager,
    private readonly sanitizer: DomSanitizer) {
    this.toolbarItems = new Array<ToolbarItem>();
  }

  close($event): void {
    this.onDocumentClosed.emit($event);
  }
  
  loadToolbar(value: IObject) {
    const userStatesAttrs = value.type.attributes.filter(x => x.type === AttributeType.UserState);
    const currentPerson = this.repository.getCurrentPerson();
    for (const stateAttr of userStatesAttrs) {
      const attrsMap = IObjectExtensions.objectAttributesToMap(value.attributes);
      const transitions = this.transitionsManager.getAvailableTransitions(stateAttr, attrsMap, currentPerson);
      transitions.forEach(t => this.addTransitionToolbarItem(t));
    }
  }

  private addTransitionToolbarItem(transition: ITransition): void {
    if (!transition.displayName || transition.displayName === "")
      return;
    
    var stateTo = this.repository.getUserState(transition.stateTo);
    const toolbarItem = new ToolbarItem(transition.displayName, stateTo.icon, this.sanitizer);
    this.toolbarItems.push(toolbarItem);
  }
}
