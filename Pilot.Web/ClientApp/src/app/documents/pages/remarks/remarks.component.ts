import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { IObject } from 'src/app/core/data/data.classes';
import { NotificationService } from 'src/app/core/notification.service';
import { RepositoryService } from 'src/app/core/repository.service';
import { DocumentsNavigationService } from '../../shared/documents-navigation.service';

@Component({
  selector: 'app-remarks',
  templateUrl: './remarks.component.html',
  styleUrls: ['./remarks.component.css', '../../shared/toolbar.css']
})
export class RemarksComponent implements OnInit, OnDestroy {

  private navigationSubscription: Subscription;

  document: IObject;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly repository: RepositoryService,
    private readonly navigationService: DocumentsNavigationService,
    private readonly notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (!id) {
        return;
      }

      this.loadDocument(id);
    });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  back(): void {
    this.navigationService.back();
  }

  onError($event: HttpErrorResponse): void {
    this.notificationService.showError($event);
  }

  private loadDocument(id: string) {
    this.repository.getObjectAsync(id)
      .then(source => {
        if (!source) {
          return;
        }

        this.document = source;
      });
  }
}
