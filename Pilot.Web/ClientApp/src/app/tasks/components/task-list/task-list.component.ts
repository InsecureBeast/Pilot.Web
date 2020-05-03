import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { TaskFilter } from '../task-filters/task-filters.component';
import { TasksRepositoryService } from '../../shared/tasks-repository.service';
import { TaskNode, TaskWorkflowNode, TaskStageNode } from "../../shared/task.node";
import { TaskNodeFactory } from "../../shared/task-node.factory";
import { TasksService } from "../../shared/tasks.service";
import { RepositoryService } from 'src/app/core/repository.service';

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
    private readonly tasksService: TasksService,
    private readonly repositoryService: RepositoryService) {

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

  showSubTasks(task: TaskNode): void {

    if (task.loadedChildren.length > 0) {
      for (var child of task.loadedChildren) {
        child.isVisible = !task.isChildrenShown;
      }

      task.isChildrenShown = !task.isChildrenShown;
      return;
    }

    if (!task.isChildrenShown)
      this.loadSubTasks(task);

    task.isChildrenShown = !task.isChildrenShown;
  }

  isStage(task: TaskNode): boolean {
    return task instanceof TaskStageNode;
  }

  private loadSubTasks(parent: TaskNode): void {
    const children = parent.source.children.map(c => c.objectId);
    let index = this.tasks.indexOf(parent);
    this.repositoryService.getObjectsAsync(children)
      .then(async objects => {
        var stages = new Array<TaskNode>();
        for (const source of objects) {
          const node = this.taskNodeFactory.createNode(source);
          if (!node)
            continue;

          index++;
          this.tasks.splice(index, 0, node);
          parent.loadedChildren.push(node);
          //await node.loadChildren(this.tasks, this.taskNodeFactory)
          stages.push(node);
        }

        for (var s of stages) {
           await s.loadChildren(this.tasks, this.taskNodeFactory)
        }
       
      })
      .catch(er => {
        this.onError.emit(er);
      });
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
