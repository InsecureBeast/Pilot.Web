import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, NavigationStart, Scroll, Event  } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { TaskFilter, TaskFiltersComponent } from '../../components/task-filters/task-filters.component';
import { TasksNavigationService } from '../../shared/tasks-navigation.service';
import { TaskNode } from '../../shared/task.node';
import { TasksSyncService as TasksService } from '../../shared/tasks.service';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { BottomSheetComponent } from 'src/app/components/bottom-sheet/bottom-sheet/bottom-sheet.component';
import { IBottomSheetConfig } from 'src/app/components/bottom-sheet/bottom-sheet/bottom-sheet.config';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css', '../../../documents/shared/toolbar.css']
})
/** tasks component*/
export class TasksComponent implements OnInit, OnDestroy {

  private navigationSubscription: Subscription;
  private routerSubscription: Subscription;

  private storageFilterName = 'tasks_filter';
  private filterId: number;

  selectedFilter: TaskFilter;
  checked: TaskNode[];
  error: HttpErrorResponse;
  options: IBottomSheetConfig;
  commonFilters: TaskFilter[];
  personalFilters: TaskFilter[];

  @ViewChild(TaskListComponent, { static: false })  private taskListComponent: TaskListComponent;
  @ViewChild('bottomSheet') private bottomSheet: BottomSheetComponent;

  /** tasks ctor */
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private tasksNavigationService: TasksNavigationService,
    private tasksService: TasksService,
    private readonly translate: TranslateService) {

    this.checked = new Array();
  }

  ngOnInit(): void {
    this.navigationSubscription = this.activatedRoute.paramMap.pipe(first()).subscribe((params: ParamMap) => {
      let filterId = params.get('filterId');
      this.filterId = +filterId;
      if (!filterId) {
        filterId = localStorage.getItem(this.storageFilterName);
        if (filterId) {
          this.filterId = +filterId;
        } else {
          this.filterId = 0;
        }
      }

      this.tasksNavigationService.navigateToFilter(this.filterId);
      localStorage.setItem(this.storageFilterName, this.filterId.toString());
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      this.processScrollEvent(event);
      this.processBackEvent(event);
    });

    this.options = {
      closeButtonTitle: 'Close',
      enableCloseButton: false,
      title: this.translate.instant('selectFilter')
    };
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  onFiltersLoaded(filters: [TaskFilter[], TaskFilter[]]): void {
    this.commonFilters = filters[0];
    this.personalFilters = filters[1];

    let selected = this.commonFilters.find(f => f.id === this.filterId);
    if (selected) {
      this.selectedFilter = selected;
      return;
    }

    selected = this.personalFilters.find(f => f.id === this.filterId);
    if (selected) {
      this.selectedFilter = selected;
      return;
    }
  }

  onFilterSelected(filter: TaskFilter): void {
    this.bottomSheet.close();
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
    this.bottomSheet.open();
  }

  closeFilters(): void {
    this.bottomSheet.close();
  }

  clearChecked(): void {
    this.checked = new Array();
    this.tasksService.changeClearChecked(true);
  }

  private processBackEvent(event: Event): void {
    if (event instanceof NavigationStart) {
      const startEvent = <NavigationStart>event;
      if (startEvent.navigationTrigger === 'popstate') {
        const node = this.tasksService.getSelectedNode();
        this.taskListComponent.affectChange(this.selectedFilter, node);
        this.taskListComponent.update(node);
      }
    }
  }

  private processScrollEvent(event: Event): void {
    if (event instanceof Scroll) {
      if (event.position) {
        window.scrollTo(0, event.position['1']);
      }
    }
  }
}
