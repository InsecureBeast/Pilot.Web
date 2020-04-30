import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { TaskFilter } from '../../components/task-filters/task-filters.component';
import { TasksNavigationService } from '../../shared/tasks-navigation.service';
import { TaskNode } from '../../shared/task.node';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css']
})
/** tasks component*/
export class TasksComponent {

  selectedFilter: TaskFilter;
  isFiltersMenuShown: boolean;

  /** tasks ctor */
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly tasksNavigationService: TasksNavigationService) {

    this.selectedFilter = new TaskFilter("", "");
  }

  onFilterSelected(filter: TaskFilter): void {
    this.isFiltersMenuShown = false;
    this.selectedFilter = filter;
    this.tasksNavigationService.navigateToFilter(filter.name);
  }

  onTaskSelected(item: TaskNode): void {
    this.tasksNavigationService.navigateToTask(item.id);
  }

  onTaskChecked(node: TaskNode): void {
    
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
}
