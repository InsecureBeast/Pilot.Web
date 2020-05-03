import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { TaskFilter } from '../../components/task-filters/task-filters.component';
import { TasksNavigationService } from '../../shared/tasks-navigation.service';
import { TaskNode } from '../../shared/task.node';
import { TasksService } from '../../shared/tasks.service';
import { ModalService } from 'src/app/ui/modal/modal.service';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css', '../../../documents/shared/toolbar.css']
})
/** tasks component*/
export class TasksComponent implements OnInit {
    

  private filtersModalId: string = "filtesModal";

  selectedFilter: TaskFilter;
  isFiltersMenuShown: boolean;
  checked: TaskNode[];
  error: HttpErrorResponse;

  /** tasks ctor */
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly tasksNavigationService: TasksNavigationService,
    private readonly tasksService: TasksService,
    private readonly modalService: ModalService ) {

    this.selectedFilter = new TaskFilter("", "");
    this.checked = new Array();
  }

  ngOnInit(): void {
    //this.modalService.add
  }

  onFilterSelected(filter: TaskFilter): void {
    this.isFiltersMenuShown = false;
    this.modalService.close(this.filtersModalId);
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
    this.error = error;
  }

  showFilters(): void {
    this.modalService.open(this.filtersModalId);
    this.isFiltersMenuShown = true;
  }

  closeFilters(): void {
    this.modalService.close(this.filtersModalId);
    this.isFiltersMenuShown = false;
  }

  clearChecked(): void {
    this.checked = new Array();
    this.tasksService.changeClearChecked(true);
  }
}
