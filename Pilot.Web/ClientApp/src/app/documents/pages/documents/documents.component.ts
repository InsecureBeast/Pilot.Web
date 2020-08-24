import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { ModalService } from 'src/app/ui/modal/modal.service';
import { DocumentListComponent } from '../../components/document-list/document-list.component';
import { IObject } from 'src/app/core/data/data.classes';
import { ObjectCardDialogService } from 'src/app/ui/object-card-dialog/object-card-dialog.service';

@Component({
    selector: 'app-documents',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.css', '../../shared/toolbar.css']
})
/** documents component*/
export class DocumentsComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject<void>();
  private navigationSubscription: Subscription;
  private routerSubscription: Subscription;
  private objectCardChangeSubscription: Subscription;
  private documentCardModal = "documentCardModal";

  checked = new Array<INode>();
  checkedNode: IObject;
  currentItem: ObjectNode;
  isLoading: boolean;
  error: HttpErrorResponse;

  @ViewChild(DocumentListComponent, { static: false })
  private documentListComponent: DocumentListComponent;
  
  /** documents ctor */
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly repository: RepositoryService,
    private readonly typeIconService: TypeIconService,
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly navigationService: DocumentsNavigationService,
    private readonly documentsService: DocumentsService,
    private readonly scrollPositionService: ScrollPositionService,
    private readonly modalService: ModalService,
    private readonly objectCardDialogService: ObjectCardDialogService) {

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

    this.objectCardChangeSubscription = this.objectCardDialogService.documentForCard$.subscribe(id => {
      this.onCloseDocumentCard();

      if (!id)
        return;
      
      this.repository.getObjectWithRequestTypeAsync(id, RequestType.New).then(object => {
        this.checkedNode = object;
      });
    });
  }

  ngOnDestroy(): void {
    this.navigationSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
    this.objectCardChangeSubscription.unsubscribe();

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

  onShowDocumentCard() : void {
    this.checkedNode = this.getCheckedNode();
    this.modalService.open(this.documentCardModal);
  }

  onCloseDocumentCard() : void {
    this.modalService.close(this.documentCardModal);
  }
  
  // onChangeDocumentCard(nodeId: string): void {
  //   this.documentListComponent.updateAsync(this.checkedNode).then(newNode => {
  //     this.checked = new Array<INode>();
  //     this.checked.push(newNode);
  //     this.checkedNode = this.getCheckedNode();
  //   });
  //   this.onCloseDocumentCard();
  // }

  private getCheckedNode() : IObject{
    if (this.checked && this.checked.length > 0)
      return this.checked[0].source;

    return undefined;  
  }
}
