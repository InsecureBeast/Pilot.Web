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
  private filtersModalId = "filtersModal";
  private filterId: number;

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
      this.filterId = +params.get('filterId');
      if (!this.filterId) {
        // todo get filter id from store
        this.tasksNavigationService.navigateToFilter(0);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription)
      this.navigationSubscription.unsubscribe();
  }

  onFiltersLoaded(filters: [TaskFilter[], TaskFilter[]]): void {
    const commonFilters = filters[0];
    const personalFilters = filters[1];

    let selected = commonFilters.find(f => f.id === this.filterId);
    if (selected) {
      this.selectedFilter = selected;
      return;
    }

    selected = personalFilters.find(f => f.id === this.filterId)
    if (selected) {
      this.selectedFilter = selected;
      return;
    }
  }

  onFilterSelected(filter: TaskFilter): void {
    this.modalService.close(this.filtersModalId);
    this.selectedFilter = filter;
    this.clearChecked();
    this.tasksNavigationService.navigateToFilter(filter.id);
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
