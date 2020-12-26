import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { ActivatedRoute, ParamMap, NavigationStart, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Subscription, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';

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
import { IObject } from 'src/app/core/data/data.classes';

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
  private documentCardModal = 'objectCardModal';

  modalRef: BsModalRef;
  checked = new Array<INode>();
  checkedNode: IObject;
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
    private readonly scrollPositionService: ScrollPositionService,
    private readonly modalService: ModalService,
    private readonly bsModalService: BsModalService) {

  }

  ngOnInit(): void {

    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      let id = params.get('id');
      if (!id) {
        id = SystemIds.rootId;
      }

      let isSource = false;
      if (this.activatedRoute.snapshot.url.length > 1) {
        const urlSegment = this.activatedRoute.snapshot.url[1].path;
        if (urlSegment === 'files') {
          isSource = true;
        }
      }

      const promise = this.repository.getObjectAsync(id);
        promise.then(source => {
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
        }
      }
    });

    this.objectCardChangeSubscription = this.documentsService.objectForCard$.subscribe(id => {
      if (!id) {
        return;
      }

      this.repository.getObjectAsync(id, RequestType.New).then(object => {
        this.checkedNode = object;
      });
    });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.objectCardChangeSubscription) {
      this.objectCardChangeSubscription.unsubscribe();
    }

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
        this.navigationService.navigateToFile(this.currentItem.id, node.id);
      } else {
        this.navigationService.navigateToDocument(this.currentItem.id, node.id);
      }

      return;
    }

    if (node.isSource) {
      this.navigationService.navigateToFilesFolder(node.id);
    } else {
      this.navigationService.navigateToDocumentsFolder(node.id);
    }
  }

  onItemsChecked(nodes: INode[]): void {
    this.checked = nodes;
  }

  onDownloadStarted(template: TemplateRef<any>): void {
    const config = new ModalOptions();
    config.backdrop = true;
    config.ignoreBackdropClick = true;
    config.animated = false;
    config.class = 'modal-dialog-centered';

    this.modalRef = this.bsModalService.show(template, config);
  }

  onDownloadFinished(any): void {
    this.bsModalService.hide();
  }

  onError(error: HttpErrorResponse): void {
    this.error = error;
  }

  onShowObjectCard(): void {
    this.checkedNode = this.getCheckedNode();
    this.modalService.open(this.documentCardModal);
  }

  onCloseObjectCard(): void {
    this.modalService.close(this.documentCardModal);
  }

  onSaveObjectCard(id: string): void {
    this.documentsService.changeObjectForCard(id);
    this.onCloseObjectCard();
  }

  private getCheckedNode(): IObject {
    if (this.checked && this.checked.length > 0) {
      return this.checked[0].source;
    }

    return undefined;
  }
}
