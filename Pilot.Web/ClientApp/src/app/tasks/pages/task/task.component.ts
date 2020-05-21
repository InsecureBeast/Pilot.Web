import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

import { IObject } from '../../../core/data/data.classes';
import { RepositoryService } from '../../../core/repository.service';

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
  styleUrls: ['./task.component.css', '../../../documents/shared/toolbar.css']
})
/** task component*/
export class TaskComponent implements OnInit, OnDestroy {
  error;

  private navigationSubscription: Subscription;

  selectedTask: IObject;

  /** task ctor */
  constructor(
    private activatedRoute: ActivatedRoute,
    private repository: RepositoryService,
    private location: Location) {

  }

  ngOnInit(): void {

    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');

      this.repository.getObjectAsync(id)
        .then(source => {
          this.selectedTask = source;

        })
        .catch(err => {
          this.error = err;
        });
    });
  }

  ngOnDestroy(): void {
    this.navigationSubscription.unsubscribe();

  }

  close($event): void {
    this.location.back();
  }
}
