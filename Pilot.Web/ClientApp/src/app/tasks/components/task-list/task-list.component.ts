import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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

  @Output() onChecked = new EventEmitter<TaskNode[]>();
  @Output() onSelected = new EventEmitter<TaskNode>();
  @Output() onError = new EventEmitter<HttpErrorResponse>();

  tasks: TaskNode[];
  isLoading: boolean;
  isAnyItemChecked: boolean;

  /** task-list ctor */
  constructor(private readonly tasksService: TasksService,
    private readonly taskNodeFactory: TaskNodeFactory) {

  }

  selected(item: TaskNode): void {
    this.clearChecked();
    this.onSelected.emit(item);
  }

  checked(node: TaskNode, event: MouseEvent): void {
    if (!event.ctrlKey) {
      this.clearChecked();
    }

    node.isChecked = !node.isChecked;
    this.isAnyItemChecked = true;

    const checked = this.tasks.filter(n => n.isChecked);
    this.onChecked.emit(checked);
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
      this.onError.emit(error);
      this.isLoading = false;
    });
  }

  private clearChecked(): void {
    if (this.tasks) {
      for (let node of this.tasks) {
        node.isChecked = false;
      }
    }

    this.isAnyItemChecked = false;
    this.onChecked.emit(null);
  }
}
