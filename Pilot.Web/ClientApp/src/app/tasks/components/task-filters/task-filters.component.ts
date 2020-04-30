import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { TaskFiltersProvider } from './task-filters.provider';
import { TasksRepositoryService } from '../../shared/tasks-repository.service';
import { CommonSettingsDefaults } from '../../../core/data/common-settings.defaults';

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

  /** task-filters ctor */
  constructor(private readonly tasksRepositoryService: TasksRepositoryService) {
    
  }

  ngOnInit(): void {
    this.tasksRepositoryService.getPersonalSettings(CommonSettingsDefaults.taskFiltersKey)
      .subscribe(settings => {
          this.filters = new Array<TaskFilter>();
          var filtersProvider = new TaskFiltersProvider(settings);
          filtersProvider.commonFilters.forEach((value: string, key: string) => {
            var filter = new TaskFilter(key, value);
            if (this.filters.length === 0) { //TODO get from local storage
              this.selectFilter(filter);
            }
            this.filters.push(filter);
          });

          this.personalFilters = new Array<TaskFilter>();
          filtersProvider.personalFilters.forEach((value: string, key: string) => {
            var filter = new TaskFilter(key, value);
            this.personalFilters.push(filter);
          });

          this.onLoaded.emit([this.filters, this.personalFilters]);
        },
        e => this.onError.emit(e));
  }

  selectFilter(filter: TaskFilter): void {
    for (let f of this.filters) {
      f.isActive = false;
    }

    for (let f of this.personalFilters) {
      f.isActive = false;
    }

    filter.isActive = !filter.isActive;
    this.onSelected.emit(filter);
  }

}

export class TaskFilter {

  constructor(name: string, filter: string) {
    this.name = name;
    this.searchValue = filter;
    this.isActive = false;
  }

  name: string;
  searchValue: string;
  isActive: boolean;
}

