import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, NavigationStart, Router } from '@angular/router';

import { Subscription, Subject } from 'rxjs';

import { Tools } from '../../../core/tools/tools';
import { IObjectNode } from '../../shared/node.interface';
import { DownloadService } from '../../../core/download.service';
import { RepositoryService } from '../../../core/repository.service';
import { IFileSnapshot, IObject } from '../../../core/data/data.classes';
import { VersionsSelectorService } from '../../components/document-versions/versions-selector.service';
import { TypeExtensions } from '../../../core/tools/type.extensions';
import { RequestType } from 'src/app/core/headers.provider';
import { DocumentsService } from '../../shared/documents.service';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { ObjectNode } from '../../shared/object.node';
import { TypeIconService } from '../../../core/type-icon.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/app/core/notification.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BottomSheetComponent } from 'src/app/components/bottom-sheet/bottom-sheet/bottom-sheet.component';
import { IBottomSheetConfig } from 'src/app/components/bottom-sheet/bottom-sheet/bottom-sheet.config';
import { ContextMenuComponent, MenuItem } from '../../components/context-menu/context-menu.component';
import { DocumentsNavigationService as DocumentsNavigationService } from '../../shared/documents-navigation.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
/** document component*/
export class DocumentComponent implements OnInit, OnDestroy {

  private routerSubscription: Subscription;
  private navigationSubscription: Subscription;
  private objectCardChangeSubscription: Subscription;
  private ngUnsubscribe = new Subject<void>();
  private cardModalRef: BsModalRef;
  
  selectedSnapshot: IFileSnapshot;
  document: IObject;
  node: ObjectNode;
  isLoading: boolean;
  error: HttpErrorResponse;

  isActualVersionSelected: boolean;
  selectedVersionCreated: string;
  selectedVersionCreator: string;

  @ViewChild('cardTemplate') private cardTemplate: TemplateRef<any>;
  @ViewChild('staticTabs', { static: false }) private staticTabs: TabsetComponent;
  @ViewChild('contextMenu') private contextMenu: ContextMenuComponent;
  @ViewChild('bottomSheet') private bottomSheet: BottomSheetComponent;
  options: IBottomSheetConfig;

  /** document-details ctor */
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly downloadService: DownloadService,
    private readonly navigationService: DocumentsNavigationService,
    private readonly repository: RepositoryService,
    private readonly router: Router,
    private readonly versionSelector: VersionsSelectorService,
    private readonly documentService: DocumentsService,
    private readonly modalService: BsModalService,
    private readonly typeIconService: TypeIconService,
    private readonly translate: TranslateService,
    private readonly notificationService: NotificationService) {

    this.isActualVersionSelected = true;
  }

  ngOnInit(): void {

    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (!id) {
        return;
      }

      const version = params.get('v');
      this.loadDocument(id, version);
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const startEvent = <NavigationStart>event;
        if (startEvent.navigationTrigger === 'popstate') {
          this.cancelAllRequests(false);
        }
      }
    });

    this.objectCardChangeSubscription = this.documentService.objectForCard$.subscribe(id => {
      if (!id) {
        return;
      }

      this.repository.getObjectAsync(id, RequestType.New).then(object => {
        this.document = object;
      });
    });

    this.options = {
    };
  }

  ngOnDestroy(): void {
    this.cancelAllRequests(true);

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }

    if (this.objectCardChangeSubscription) {
      this.objectCardChangeSubscription.unsubscribe();
    }
  }

  close($event): void {
    this.cancelAllRequests(false);
    this.repository.setRequestType(RequestType.FromCache);
    this.navigationService.back();
  }

  download($event): void {
    this.downloadService.downloadFile(this.document);
  }

  downloadDocument($event: IObjectNode) {
    this.downloadService.downloadFile($event.source);
  }

  onShowMore($event): void {
    this.fillContextMenu();
    this.bottomSheet.open();
  }

  selectActualVersion(): boolean {
    this.selectedSnapshot = this.document.actualFileSnapshot;
    this.onVersionSelected(this.selectedSnapshot);
    this.versionSelector.changeSelectedSnapshot(this.selectedSnapshot);
    return false;
  }

  onVersionSelected(snapshot: IFileSnapshot): void {
    if (!snapshot) {
      return;
    }

    if (!this.document) {
      return;
    }

    this.isActualVersionSelected = this.document.actualFileSnapshot.created === snapshot.created;
    let version = '';
    if (!this.isActualVersionSelected) {
      version = snapshot.created;
    }

    this.navigationService.updateLocation(this.document.parentId, this.document.id, version);
    this.selectedSnapshot = snapshot;
  }

  showFiles(event: boolean): void {
    this.navigationService.navigateToFilesFolder(this.node.id);
  }

  onShowDocumentCard(template: TemplateRef<any>): void {
    const config = new ModalOptions();
    config.animated = true;
    config.class = 'modal-dialog-centered align-items-stretch';
    this.cardModalRef = this.modalService.show(template, config);
  }

  onCloseDocumentCard($event): void {
    this.modalService.hide(this.cardModalRef.id);
  }

  onChangeDocumentCard(id: string): void {
    this.documentService.changeObjectForCard(id);
    this.onCloseDocumentCard(null);
  }

  selectTab(tabId: number) {
    this.staticTabs.tabs[tabId].active = true;
  }

  onError($event): void {
    this.notificationService.showError($event);
  }

  isSourceFile(): boolean {
    if (this.document) {
      return TypeExtensions.isProjectFileOrFolder(this.document.type);
    }

    return false;
  }

  private goToVersionsPage(): void {
    this.navigationService.navigateToDocumentVersions(this.document.parentId, this.document.id, false);
  }
  private goToRemarksPage() : void {
    this.navigationService.navigateToDocumentRemarks(this.document.parentId, this.document.id, false);
  }

  private loadDocument(id: string, version?: string): void {
    this.error = null;
    this.repository.getObjectAsync(id)
      .then(source => {
        if (!source) {
          return;
        }

        this.document = source;
        if (source.type.isMountable) {
          this.node = new ObjectNode(source, true, this.typeIconService, this.ngUnsubscribe, this.translate);
        }
        let snapshot = source.actualFileSnapshot;
        this.isActualVersionSelected = !version;
        if (!this.isActualVersionSelected) {
          snapshot = source.previousFileSnapshots.find(f => f.created === version);
        }

        if (snapshot) {
          this.selectedVersionCreated = Tools.toUtcCsDateTime(snapshot.created).toLocaleString();
          this.selectedVersionCreator = '';
          const creator = this.repository.getPerson(snapshot.creatorId);
          if (creator) {
            this.selectedVersionCreator = creator.displayName;
          }
        }

        this.selectedSnapshot = snapshot;
      })
      .catch(e => {
        this.isLoading = false;
        this.error = e;
      });
  }

  private cancelAllRequests(isComplete: boolean): void {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      if (isComplete) {
        this.ngUnsubscribe.complete();
      }
    }
  }

  private fillContextMenu() {
    this.contextMenu.clear();

    const downloadItem = MenuItem
      .createItem('downloadId', this.translate.instant('download'))
      .withIcon('save_alt')
      .withAction(() => {
        this.bottomSheet.close();
        this.download(null);
      });
    this.contextMenu.addMenuItem(downloadItem);

    if (this.document.type.isMountable) {
      const sourceFilesItem = MenuItem
        .createItem('sourceFilesId', this.translate.instant('sourceFiles'))
        .withIcon('folder_open')
        .withAction(() => {
          this.bottomSheet.close();
          this.showFiles(true);
        });
      this.contextMenu.addMenuItem(sourceFilesItem);
    }

    const versionsItem = MenuItem
        .createItem('remarksId', this.translate.instant('remarks'))
        .withIcon('textsms')
        .withAction(() => {
          this.bottomSheet.close();
          this.goToRemarksPage();
        });
      this.contextMenu.addMenuItem(versionsItem);

    if (!this.isSourceFile()) {
      const signaturesItem = MenuItem
        .createItem('signaturesId', this.translate.instant('signatures'))
        .withIcon('edit')
        .withAction(() => {
          this.bottomSheet.close();
          this.navigationService.navigateToDocumentSignatures(this.document.parentId, this.document.id, false);
        });
      this.contextMenu.addMenuItem(signaturesItem);

      const versionsItem = MenuItem
        .createItem('versionsId', this.translate.instant('versions'))
        .withIcon('list_alt')
        .withAction(() => {
          this.bottomSheet.close();
          this.goToVersionsPage();
        });
      this.contextMenu.addMenuItem(versionsItem);
    }
    const cardItem = MenuItem
      .createItem('cardId', this.translate.instant('card'))
      .withIcon('info_outline')
      .withAction(() => {
        this.bottomSheet.close();
        this.onShowDocumentCard(this.cardTemplate);
      });
    this.contextMenu.addMenuItem(cardItem);
  }
}
