import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, NavigationStart, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Subscription, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { SystemIds } from '../../../core/data/system.ids';
import { RepositoryService } from '../../../core/repository.service';
import { ObjectNode } from '../../shared/object.node';
import { TypeIconService } from '../../../core/type-icon.service';
import { INode } from '../../shared/node.interface';
import { DocumentsNavigationService } from '../../shared/documents-navigation.service';
import { DocumentsService } from '../../shared/documents.service';
import { ScrollPositionService } from '../../../core/scroll-position.service';
import { RequestType } from 'src/app/core/headers.provider';

@Component({
    selector: 'app-documents',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.css']
})
/** documents component*/
export class DocumentsComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject<void>();
  private navigationSubscription: Subscription;
  private routerSubscription: Subscription;

  checked = new Array<INode>();
  currentItem: ObjectNode;
  isLoading: boolean;
  error: HttpErrorResponse;
  
  /** documents ctor */
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly repository: RepositoryService,
    private readonly typeIconService: TypeIconService,
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly navigationService: DocumentsNavigationService,
    private readonly documentsService: DocumentsService,
    private readonly scrollPositionService: ScrollPositionService) {

  }

  ngOnInit(): void {

    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      let id = params.get('id');
      if (!id)
        id = SystemIds.rootId;

      let isSource = false;
      if (this.activatedRoute.snapshot.url.length !== 0) {
        const urlSegment = this.activatedRoute.snapshot.url[0].path;
        if (urlSegment === 'files')
          isSource = true;
      }

      this.repository.getObjectAsync(id)
        .then(source => {
          this.currentItem = new ObjectNode(source, isSource, this.typeIconService, this.ngUnsubscribe, this.translate);
          this.isLoading = false;
        })
        .catch(err => {
          this.error = err;
          this.isLoading = false;
        });
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const startEvent = <NavigationStart>event;
        if (startEvent.navigationTrigger === 'popstate') {
          this.documentsService.changeClearChecked(true);
          this.repository.requestType = RequestType.FromCache;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.navigationSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();

    // cancel
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onListLoaded(node: INode): void {
    this.scrollPositionService.restoreScrollPosition(this.currentItem.id);
  }

  onItemSelected(node: INode): void {
    this.scrollPositionService.saveScrollPosition(this.currentItem.id);

    if (node.isDocument) {
      if (node.isSource) {
        this.navigationService.navigateToFile(node.id);
      } else {
        this.navigationService.navigateToDocument(node.id);
      }
      
      return;
    }

    if (node.isSource)
      this.navigationService.navigateToFilesFolder(node.id);
    else
      this.navigationService.navigateToDocumentsFolder(node.id);
  }

  onItemsChecked(nodes: INode[]): void {
    this.checked = nodes;
  }

  onError(error): void {
    this.error = error;
  }
}
