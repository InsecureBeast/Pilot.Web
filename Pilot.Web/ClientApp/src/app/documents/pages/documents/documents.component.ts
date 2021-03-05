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
import { DocumentsService } from '../../shared/documents.service';
import { ScrollPositionService } from '../../../core/scroll-position.service';
import { RequestType } from 'src/app/core/headers.provider';
import { IObject } from 'src/app/core/data/data.classes';
import { DocumentsNavigationService } from '../../shared/documents-navigation.service';

@Component({
    selector: 'app-documents',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.css', '../../shared/toolbar.css']
})
/** documents component*/
export class DocumentsComponent implements OnInit, OnDestroy {

  protected ngUnsubscribe = new Subject<void>();
  protected navigationSubscription: Subscription;
  private routerSubscription: Subscription;
  private objectCardChangeSubscription: Subscription;

  private modalRef: BsModalRef;
  private cardModalRef: BsModalRef;

  checked = new Array<INode>();
  checkedNode: IObject;
  currentItem: ObjectNode;
  isLoading: boolean;
  error: HttpErrorResponse;

  /** documents ctor */
  constructor(
    protected readonly activatedRoute: ActivatedRoute,
    protected readonly repository: RepositoryService,
    private readonly typeIconService: TypeIconService,
    private readonly translate: TranslateService,
    protected readonly router: Router,
    private readonly navigationService: DocumentsNavigationService,
    private readonly documentsService: DocumentsService,
    private readonly scrollPositionService: ScrollPositionService,
    private readonly bsModalService: BsModalService) {

  }

  ngOnInit(): void {
    this.subscribeNavigation();

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
        if (this.checked && this.checked.length > 0) {
          this.checked[0].update(object);
        }
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
    config.backdrop = false;
    config.ignoreBackdropClick = true;
    config.animated = false;
    config.class = 'modal-dialog-centered';

    this.modalRef = this.bsModalService.show(template, config);
  }

  onDownloadFinished(any): void {
    if (this.modalRef) {
      this.bsModalService.hide(this.modalRef.id);
    }
  }

  onError(error: HttpErrorResponse): void {
    this.error = error;
  }

  onShowObjectCard(template: TemplateRef<any>): void {
    this.checkedNode = this.getCheckedNode();
    const config = new ModalOptions();
    config.animated = true;
    config.class = 'modal-dialog-centered align-items-stretch';
    this.cardModalRef = this.bsModalService.show(template, config);
  }

  onCloseObjectCard(): void {
    if (this.cardModalRef) {
      this.bsModalService.hide(this.cardModalRef.id);
    }
  }

  onSaveObjectCard(id: string): void {
    this.documentsService.changeObjectForCard(id);
    this.onCloseObjectCard();
  }

  protected subscribeNavigation(): void {
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
  }

  private getCheckedNode(): IObject {
    if (this.checked && this.checked.length > 0) {
      return this.checked[0].source;
    }

    return undefined;
  }
}
