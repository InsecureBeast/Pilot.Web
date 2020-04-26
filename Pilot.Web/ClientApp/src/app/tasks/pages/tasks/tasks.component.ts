import { Component } from '@angular/core';

import { TaskFilter } from '../../components/task-filters/task-filters.component';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css']
})
/** tasks component*/
export class TasksComponent {

  selectedFilter: TaskFilter;

  /** tasks ctor */
  constructor() {

  }

  onFilterSelected(filter: TaskFilter): void {
    this.selectedFilter = filter;
  }
}
