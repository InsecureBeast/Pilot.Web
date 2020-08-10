import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

import { IObject, AttributeType, ITransition } from '../../../core/data/data.classes';
import { RepositoryService } from '../../../core/repository.service';
import { TransitionsManager } from 'src/app/core/transitions/transitions.manager';
import { IObjectExtensions } from 'src/app/core/tools/iobject.extensions';

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
  styleUrls: ['./task.component.css', '../../../documents/shared/toolbar.css']
})
/** task component*/
export class TaskComponent implements OnInit, OnDestroy {
  error;

  private navigationSubscription: Subscription;

  selectedTask: IObject;
  toolbarItems : ITransition[];

  /** task ctor */
  constructor(
    private activatedRoute: ActivatedRoute,
    private repository: RepositoryService,
    private location: Location,
    private readonly transitionsManager: TransitionsManager) {

    this.toolbarItems = new Array<ITransition>();  
  }

  ngOnInit(): void {

    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');

      this.repository.getObjectAsync(id)
        .then(source => {
          this.selectedTask = source;
          const userStatesAttrs = source.type.attributes.filter(x => x.type === AttributeType.UserState);
          const currentPerson = this.repository.getCurrentPerson();
          for (const stateAttr of userStatesAttrs) {
            const attrsMap = IObjectExtensions.objectAttributesToMap(this.selectedTask.attributes);
            const transitions = this.transitionsManager.getAvailableTransitions(stateAttr, attrsMap, currentPerson);
            transitions.forEach(t => {
              this.toolbarItems.push(t);
            });
          }
        })
        .catch(err => {
          this.error = err;
        });
    });
  }

  ngOnDestroy(): void {
    this.navigationSubscription.unsubscribe();

  }

  close($event): void {
    this.location.back();
  }
}
