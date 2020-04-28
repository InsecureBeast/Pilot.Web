import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, NavigationStart, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';

import { Subscription, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { IAttribute, AttributeType, IOrganizationUnit, IPerson, OrgUnitKind, IObject } from '../../../core/data/data.classes';
import { Tools } from '../../../core/tools/tools';
import { RepositoryService } from '../../../core/repository.service';
import { SystemTaskAttributes } from '../../../core/data/system.types';
import { TypeIconService } from '../../../core/type-icon.service';

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css']
})
/** task component*/
export class TaskComponent implements OnInit, OnDestroy {
  error;

  private navigationSubscription: Subscription;

  selectedTask: IObject;

  /** task ctor */
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly repository: RepositoryService,
    private readonly translate: TranslateService,
    private readonly iconService: TypeIconService) {

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
    //this.routerSubscription.unsubscribe();

    // cancel
    //this.ngUnsubscribe.next();
    //this.ngUnsubscribe.complete();
  }
}
