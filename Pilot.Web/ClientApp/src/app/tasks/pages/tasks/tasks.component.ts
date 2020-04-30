import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TaskFilter } from '../../components/task-filters/task-filters.component';
import { TasksNavigationService } from '../../shared/tasks-navigation.service';
import { TaskNode } from '../../shared/task.node';
import { TasksService } from '../../shared/tasks.service';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css', '../../../documents/shared/toolbar.css']
})
/** tasks component*/
export class TasksComponent {

  selectedFilter: TaskFilter;
  isFiltersMenuShown: boolean;
  checked: TaskNode[];

  /** tasks ctor */
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly tasksNavigationService: TasksNavigationService,
    private readonly tasksService: TasksService) {

    this.selectedFilter = new TaskFilter("", "");
    this.checked = new Array();
  }

  onFilterSelected(filter: TaskFilter): void {
    this.isFiltersMenuShown = false;
    this.selectedFilter = filter;
    this.tasksNavigationService.navigateToFilter(filter.name);
  }

  onTaskSelected(item: TaskNode): void {
    this.tasksNavigationService.navigateToTask(item.id);
  }

  onTaskChecked(items: TaskNode[]): void {
    this.checked = items;
  }

  onError(error): void {
    //this.error = error;
  }

  showFilters(): void {
    this.isFiltersMenuShown = true;
  }

  closeFilters(): void {
    this.isFiltersMenuShown = false;
  }

  clearChecked(): void {
    this.checked = new Array();
    this.tasksService.changeClearChecked(true);
  }
}
