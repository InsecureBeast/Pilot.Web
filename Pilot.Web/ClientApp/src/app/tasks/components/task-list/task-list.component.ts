import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { TaskFilter } from '../task-filters/task-filters.component';
import { TasksRepositoryService } from '../../shared/tasks-repository.service';
import { TaskNode } from "../../shared/task.node";
import { TaskNodeFactory } from "../../shared/task-node.factory";
import { TasksService } from "../../shared/tasks.service";

@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.component.html',
    styleUrls: ['./task-list.component.css']
})
/** task-list component*/
export class TaskListComponent implements  OnInit, OnDestroy{

  private clearCheckedSubscription: Subscription;
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
  constructor(private readonly tasksRepositoryService: TasksRepositoryService,
    private readonly taskNodeFactory: TaskNodeFactory,
    private readonly tasksService: TasksService) {

  }

  ngOnInit(): void {
    this.clearCheckedSubscription = this.tasksService.clearChecked.subscribe(v => {
      if (v)
        this.clearChecked();
    });
  }

  ngOnDestroy(): void {
    if (this.clearCheckedSubscription)
      this.clearCheckedSubscription.unsubscribe();
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

    this.tasksRepositoryService.getTasks(filter.searchValue).pipe(first()).subscribe(objects => {
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
