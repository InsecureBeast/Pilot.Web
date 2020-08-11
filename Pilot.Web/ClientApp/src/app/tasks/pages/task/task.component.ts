import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

import { IObject, AttributeType, ITransition } from '../../../core/data/data.classes';
import { RepositoryService } from '../../../core/repository.service';
import { TransitionsManager } from 'src/app/core/transitions/transitions.manager';
import { IObjectExtensions } from 'src/app/core/tools/iobject.extensions';
import { TransitionCommand } from '../../shared/transition.command';
import { ToolbarItem } from '../../shared/toolbar.item';
import { TaskToolbarComponent } from '../../components/task-toolbar/task-toolbar.component';

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

  @ViewChild(TaskToolbarComponent, { static: false })
  private toolbar: TaskToolbarComponent;

  /** task ctor */
  constructor(
    private activatedRoute: ActivatedRoute,
    private repository: RepositoryService,
    private location: Location,
    private readonly transitionsManager: TransitionsManager) {

    
  }

  ngOnInit(): void {

    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');

      this.repository.getObjectAsync(id)
        .then(source => {
          this.selectedTask = source;
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

  makeTransition($event: TransitionCommand): void {
    if (!$event)
      return;

    if (!$event.transition.stateTo)
      return;

    if ($event.transition.stateTo === "")
      return;

    const modifier = this.repository.newModifier();
    modifier.edit(this.selectedTask.id).setAttribute($event.attrName, $event.transition.stateTo);
    modifier.apply().subscribe(r => {
      this.repository.getObjectAsync(this.selectedTask.id)
        .then(source => {
          this.selectedTask = source;
          this.toolbar.loadToolbar(this.selectedTask);
        })
        .catch(err => {
          this.error = err;
        });
    }, e => {
      this.error = e;
    });
    //if (stateId == SystemStates.TASK_REVOKED_STATE_ID) {
    //  string deleteMessage;
    //  if (selectedTasks.Count == 1) {
    //    var first = selectedTasks.First();
    //    deleteMessage = string.Format(LocalizationResources.RevokeTaskConfirmationFormat, first.Title);
    //  }
    //  else
    //    deleteMessage = string.Format(LocalizationResources.RevokeTasksConfirmationFormat,
    //      selectedTasks.Count);

    //  if (viewModelContext.DialogService.AskRevokeConfirmation(deleteMessage) == false)
    //    return;
    //}
  }
}
