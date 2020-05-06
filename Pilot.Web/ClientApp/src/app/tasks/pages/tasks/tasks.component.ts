import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

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
export class TasksComponent implements OnInit, OnDestroy {
    
  private navigationSubscription: Subscription;
  private filtersModalId: string = "filtersModal";
  private filterName: string;

  selectedFilter: TaskFilter;
  checked: TaskNode[];
  error: HttpErrorResponse;

  /** tasks ctor */
  constructor(
    private activatedRoute: ActivatedRoute,
    private tasksNavigationService: TasksNavigationService,
    private tasksService: TasksService,
    private modalService: ModalService ) {

    this.checked = new Array();
  }

  ngOnInit(): void {
    this.navigationSubscription = this.activatedRoute.paramMap.pipe(first()).subscribe((params: ParamMap) => {
      this.filterName = params.get('filter');
    });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription)
      this.navigationSubscription.unsubscribe();
  }

  onFiltersLoaded(filters: [TaskFilter[], TaskFilter[]]): void {
    let commonFilters = filters[0];
    let personalFilters = filters[1];

    if (!this.filterName) {
      if (commonFilters.length > 0) {
        this.selectedFilter = commonFilters[0];
        return;
      }

      if (personalFilters.length > 0) {
        this.selectedFilter = personalFilters[0];
      }
      return;
    }

    let selected = commonFilters.find(f => f.name === this.filterName);
    if (selected) {
      this.selectedFilter = selected;
      return;
    }

    selected = personalFilters.find(f => f.name === this.filterName)
    if (selected) {
      this.selectedFilter = selected;
      return;
    }
  }

  onFilterSelected(filter: TaskFilter): void {
    this.modalService.close(this.filtersModalId);
    this.selectedFilter = filter;
    this.clearChecked();
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
  }

  closeFilters(): void {
    this.modalService.close(this.filtersModalId);
  }

  clearChecked(): void {
    this.checked = new Array();
    this.tasksService.changeClearChecked(true);
  }
}
