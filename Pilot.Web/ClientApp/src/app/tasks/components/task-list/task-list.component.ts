import { Component, Input } from '@angular/core';

import { first } from 'rxjs/operators';

import { TaskFilter } from '../task-filters/task-filters.component';
import { TasksService } from '../../shared/tasks.service';
import { TaskNode } from "../../shared/task.node";
import { TaskNodeFactory } from "../../shared/task-node.factory";

@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.component.html',
    styleUrls: ['./task-list.component.css']
})
/** task-list component*/
export class TaskListComponent {

  private _filter: TaskFilter;

  @Input()
  set filter(f: TaskFilter) {
    this._filter = f;
    this.loadTasks(f);
  }

  tasks: TaskNode[];
  isLoading: boolean;

  /** task-list ctor */
  constructor(private readonly tasksService: TasksService,
    private readonly taskNodeFactory: TaskNodeFactory) {

  }

  private loadTasks(filter: TaskFilter): void {
    this.isLoading = true;

    if (!filter)
      return;

    this.tasksService.getTasks(filter.searchValue).pipe(first()).subscribe(objects => {
      this.isLoading = false;
      this.tasks = new Array<TaskNode>();
      for (let source of objects) {
        const task = this.taskNodeFactory.createNode(source);
        // is not a task. is Workflow?
        if (task == null)
          continue;;

        this.tasks.push(task);
      }
    }, error => {
      //this.onError.emit(error);
      this.isLoading = false;
    });
  }
}
