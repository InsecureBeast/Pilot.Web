import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { TaskFiltersProvider } from './task-filters.provider';
import { TasksRepositoryService } from '../../shared/tasks-repository.service';
import { CommonSettingsDefaults } from '../../../core/data/common-settings.defaults';

export class TaskFilter {
  constructor(id: number, name: string, filter: string) {
    this.id = id;
    this.name = name;
    this.searchValue = filter;
    this.isActive = false;
  }

  name: string;
  searchValue: string;
  isActive: boolean;
  id: number;
}

@Component({
    selector: 'app-task-filters',
    templateUrl: './task-filters.component.html',
    styleUrls: ['./task-filters.component.css']
})
/** task-filters component*/
export class TaskFiltersComponent implements OnInit {

  filters: TaskFilter[] = new Array();
  personalFilters: TaskFilter[] = new Array();

  @Output() onSelected = new EventEmitter<TaskFilter>();
  @Output() onError = new EventEmitter<HttpErrorResponse>();
  @Output() onLoaded = new EventEmitter<[TaskFilter[], TaskFilter[]]>();


  @Input()
  set selectedFilter(filter: TaskFilter) {
    this.selectFilterOnly(filter);
  }

  /** task-filters ctor */
  constructor(private tasksRepositoryService: TasksRepositoryService) {
    this.personalFilters = new Array();
    this.filters = new Array();
  }

  ngOnInit(): void {
    this.tasksRepositoryService.getPersonalSettings(CommonSettingsDefaults.taskFiltersKey)
      .subscribe(settings => {
          let index = 0;
          this.filters = new Array();
          const filtersProvider = new TaskFiltersProvider(settings);
          filtersProvider.commonFilters.forEach((value: string, key: string) => {
            const filter = new TaskFilter(index++, key, value);
            this.filters.push(filter);
          });

          this.personalFilters = new Array();
          filtersProvider.personalFilters.forEach((value: string, key: string) => {
            const filter = new TaskFilter(index++, key, value);
            this.personalFilters.push(filter);
          });

          this.onLoaded.emit([this.filters, this.personalFilters]);
        },
        e => this.onError.emit(e));
  }

  selectFilter(filter: TaskFilter): void {
    this.selectFilterOnly(filter);
    this.onSelected.emit(filter);
  }

  selectFilterOnly(filter: TaskFilter): void {
    if (!filter) {
      return;
    }

    for (const f of this.filters) {
      f.isActive = f.name === filter.name;
    }

    for (const f of this.personalFilters) {
      f.isActive = f.name === filter.name;
    }
  }
}
