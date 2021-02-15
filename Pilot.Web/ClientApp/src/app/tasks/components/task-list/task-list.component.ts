import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { first } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';

import { TaskFilter } from '../task-filters/task-filters.component';
import { TasksRepositoryService } from '../../shared/tasks-repository.service';
import { TaskNode, TaskWorkflowNode, TaskStageNode } from "../../shared/task.node";
import { TaskNodeFactory } from "../../shared/task-node.factory";
import { TasksSyncService as TasksService } from "../../shared/tasks.service";
import { RepositoryService } from 'src/app/core/repository.service';
import { TypeExtensions } from 'src/app/core/tools/type.extensions';

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
  constructor(private tasksRepositoryService: TasksRepositoryService,
    private taskNodeFactory: TaskNodeFactory,
    private tasksService: TasksService,
    private repositoryService: RepositoryService) {

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

  check(node: TaskNode, event: MouseEvent): void {
    if (!event.ctrlKey) {
      this.clearChecked();
    }

    node.isChecked = !node.isChecked;
    this.isAnyItemChecked = true;

    const checked = this.tasks.filter(n => n.isChecked);
    this.onChecked.emit(checked);
  }

  update(node: TaskNode): void {
    if (!node){
      return;
    }

    this.repositoryService.getObjectAsync(node.source.id).then(source => {
      node.update(source);
    });
  }

  addChecked(node: TaskNode): void {
    node.isChecked = !node.isChecked;
    this.isAnyItemChecked = true;

    const checked = this.tasks.filter(n => n.isChecked);
    this.onChecked.emit(checked);

    if (checked.length === 0)
      this.isAnyItemChecked = false;
  }

  showSubTasks(task: TaskNode): void {

    if (task.loadedChildren.length > 0) {
      for (let child of task.loadedChildren) {
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

  isInWorkflow(task: TaskNode): boolean {
    return task.isInWorkflow || task instanceof TaskWorkflowNode;
  }

  isWorkflow(task: TaskNode): boolean {
    return task instanceof TaskWorkflowNode;
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
          
          node.setIntent();

          index++;
          this.tasks.splice(index, 0, node);
          parent.loadedChildren.push(node);
          stages.push(node);
        }

        for (var s of stages) {
           await s.loadChildren(this.tasks, this.taskNodeFactory);
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
          continue;

        this.tasks.push(task);
      }
    }, error => {
      this.onError.emit(error);
      this.isLoading = false;
    });
  }

  affectChange(filter: TaskFilter, task: TaskNode): void {
    if (!task)
      return;

    if (TypeExtensions.isTask(task.type)){
      const parent = this.findWorkflowParent(task);
      if (parent)
        return;
    }

    this.tasksRepositoryService.getTasksWithFilter(filter.searchValue, task.id).pipe(first()).subscribe(objects => {
      if (!objects || objects.length === 0) {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index > -1) {
          if (TypeExtensions.isWorkflow(task.type)) {
            this.removeWorkflowChildren(task);
          }
          if (TypeExtensions.isStage(task.type)) {
            this.removeWorkflowChildren(task);
          }  
          this.tasks.splice(index, 1);
        }
      }
    }, error => {
      this.onError.emit(error);
      this.isLoading = false;}
    );
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

  private removeWorkflowChildren(task: TaskNode): void {
    if (!task)
      return;
    
    task.source.children.forEach(c => {
      const childIndex = this.tasks.findIndex(tc => tc.id === c.objectId);
      if (childIndex < 0)
        return;

      const child = this.tasks.find(t => t.id === c.objectId);
      this.tasks.splice(childIndex, 1);
      this.removeWorkflowChildren(child);
    });
  }

  private findWorkflowParent(task: TaskNode): TaskNode {
    let parent = this.tasks.find(p => p.id === task.source.parentId);
    if (!parent)
      return undefined;
    
    if (TypeExtensions.isWorkflow(parent.type))  {
      return parent;
    }

    return this.findWorkflowParent(parent);
  }
}
