import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, NavigationStart, Scroll  } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { TaskFilter } from '../../components/task-filters/task-filters.component';
import { TasksNavigationService } from '../../shared/tasks-navigation.service';
import { TaskNode } from '../../shared/task.node';
import { TasksSyncService as TasksService } from '../../shared/tasks.service';
import { ModalService } from 'src/app/ui/modal/modal.service';
import { TaskListComponent } from '../../components/task-list/task-list.component';


@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css', '../../../documents/shared/toolbar.css']
})
/** tasks component*/
export class TasksComponent implements OnInit, OnDestroy {
  
  private navigationSubscription: Subscription;
  private routerSubscription: Subscription;

  private filtersModalId = "filtersModal";
  private storageFilterName = "tasks_filter";
  private filterId: number;

  selectedFilter: TaskFilter;
  checked: TaskNode[];
  error: HttpErrorResponse;

  @ViewChild(TaskListComponent, { static: false })
  private taskListComponent: TaskListComponent;

  /** tasks ctor */
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private tasksNavigationService: TasksNavigationService,
    private tasksService: TasksService,
    private modalService: ModalService) {

    this.checked = new Array();
  }

  ngOnInit(): void {
    this.navigationSubscription = this.activatedRoute.paramMap.pipe(first()).subscribe((params: ParamMap) => {
      let filterId = params.get('filterId');
      this.filterId = +filterId;
      if (!filterId) {
        filterId = localStorage.getItem(this.storageFilterName);
        if (filterId)
          this.filterId = +filterId;
        else
          this.filterId = 0;
      }

      this.tasksNavigationService.navigateToFilter(this.filterId);
      localStorage.setItem(this.storageFilterName, this.filterId.toString());
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof Scroll) {
        if (event.position) {
          window.scrollTo(0, event.position["1"]);
        }
      }
      if (event instanceof NavigationStart) {
        const startEvent = <NavigationStart>event;
        if (startEvent.navigationTrigger === 'popstate') {
          const node = this.tasksService.getSelectedNode();
          this.taskListComponent.update(node);
          this.taskListComponent.affectChange(this.selectedFilter, node.id);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription)
      this.navigationSubscription.unsubscribe();

    if (this.routerSubscription)
      this.routerSubscription.unsubscribe();
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
    this.tasksService.changeSelectedNode(undefined);
    localStorage.setItem(this.storageFilterName, filter.id.toString());
    this.tasksNavigationService.navigateToFilter(filter.id);
  }

  onTaskSelected(item: TaskNode): void {
    this.tasksService.changeSelectedNode(item);
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
