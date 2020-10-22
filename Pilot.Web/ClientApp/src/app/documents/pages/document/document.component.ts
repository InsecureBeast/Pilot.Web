import { Component, OnInit, OnDestroy } from '@angular/core';
import { SafeUrl, Title } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, NavigationStart, Router } from '@angular/router';
import { Location } from '@angular/common';

import { Subscription, Subject } from 'rxjs';

import { Tools } from '../../../core/tools/tools';
import { INode } from '../../shared/node.interface';
import { FilesSelector } from '../../../core/tools/files.selector';
import { SourceFileService } from '../../../core/source-file.service';
import { DownloadService } from '../../../core/download.service';
import { RepositoryService } from '../../../core/repository.service';
import { Constants } from '../../../core/constants';
import { IFileSnapshot, IObject } from '../../../core/data/data.classes';
import { VersionsSelectorService } from '../../components/document-versions/versions-selector.service';
import { TypeExtensions } from '../../../core/tools/type.extensions';
import { RequestType } from 'src/app/core/headers.provider';
import { ModalService } from 'src/app/ui/modal/modal.service';
import { DocumentsService } from '../../shared/documents.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
/** document component*/
export class DocumentComponent implements OnInit, OnDestroy {

  private versionSubscription: Subscription;
  private routerSubscription: Subscription;
  private navigationSubscription: Subscription;
  private objectCardChangeSubscription: Subscription;
  private ngUnsubscribe = new Subject<void>();
  private documents = new Array<string>();
  private documentCardModal = 'documentCardModal';

  document: IObject;
  images: SafeUrl[];
  isLoading: boolean;
  isInfoShown: boolean;
  error: HttpErrorResponse;

  isActualVersionSelected: boolean;
  selectedVersionCreated: string;
  selectedVersionCreator: string;

  /** document-details ctor */
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly sourceFileService: SourceFileService,
    private readonly downloadService: DownloadService,
    private readonly location: Location,
    private readonly repository: RepositoryService,
    private readonly router: Router,
    private readonly versionSelector: VersionsSelectorService,
    private readonly documentService: DocumentsService,
    private readonly modalService: ModalService) {

    this.isActualVersionSelected = true;
    this.images = new Array();
  }

  ngOnInit(): void {
    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (!id) {
        return;
      }

      const version = params.get('v');
      this.loadDocument(id, version, true);
    });

    this.versionSubscription = this.versionSelector.selectedSnapshot$.subscribe(s => {
      if (!s) {
        return;
      }

      if (!this.document) {
        return;
      }

      this.isActualVersionSelected = this.document.actualFileSnapshot.created === s.created;
      let version = '';
      if (!this.isActualVersionSelected) {
        version = s.created;
      }

      this.updateLocation(this.document.id, version);
      this.loadSnapshot(s);
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
  }

  ngOnDestroy(): void {
    this.cancelAllRequests(true);

    if (this.versionSubscription) {
      this.versionSubscription.unsubscribe();
    }

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
    this.location.back();
  }

  download($event): void {
    this.downloadService.downloadFile(this.document);
  }

  toggleDocumentVersions($event): void {
    this.isInfoShown = !this.isInfoShown;
  }

  closeDocumentVersions(): void {
    this.isInfoShown = false;
  }

  selectActualVersion(): boolean {
    this.versionSelector.changeSelectedSnapshot(this.document.actualFileSnapshot);
    return false;
  }

  previousDocument(node: INode) {
    this.cancelAllRequests(false);
    const indexOf = this.documents.findIndex(doc => doc === this.document.id);
    if (!this.canPreviousDocument(indexOf)) {
      return;
    }

    const prevId = this.documents[indexOf - 1];
    this.loadDocument(prevId);
    this.updateLocation(prevId);
  }

  nextDocument(node: INode) {
    this.cancelAllRequests(false);
    const indexOf = this.documents.findIndex(doc => doc === this.document.id);
    if (!this.canNextDocument(indexOf)) {
      return;
    }

    const nextId = this.documents[indexOf + 1];
    this.loadDocument(nextId);
    this.updateLocation(nextId);
  }

  onShowDocumentCard(): void {
    this.modalService.open(this.documentCardModal);
  }

  onCloseDocumentCard(): void {
    this.modalService.close(this.documentCardModal);
  }

  onChangeDocumentCard(id: string): void {
    this.documentService.changeObjectForCard(id);
    this.onCloseDocumentCard();
  }

  private loadDocument(id: string, version?: string, loadNeighbors?: boolean): void {
    this.error = null;
    this.repository.getObjectAsync(id)
      .then(source => {
        if (!source) {
          return;
        }

        this.document = source;
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

        this.loadSnapshot(snapshot);

        if (loadNeighbors) {
          this.loadNeighbors(source);
        }
      })
      .catch(e => {
        this.isLoading = false;
        this.error = e;
      });
  }

  private loadNeighbors(source: IObject): void {
    this.repository.getObjectAsync(source.parentId)
      .then(parent => {
        for (const child of parent.children) {
          const type = this.repository.getType(child.typeId);
          if (TypeExtensions.isDocument(type)) {
            this.documents.push(child.objectId);
          }
        }
      }).catch(e => {
        this.isLoading = false;
        this.error = e;
      });
  }

  private updateLocation(id: string, version?: string): void {
    if (!version) {
      this.location.replaceState('document/' + id);
    } else {
      this.location.replaceState('document/' + id + '/' + version);
    }
  }

  private loadSnapshot(snapshot: IFileSnapshot): void {
    this.isLoading = true;
    this.images = new Array<SafeUrl>();

    if (this.sourceFileService.isXpsFile(snapshot)) {
      const file = FilesSelector.getSourceFile(snapshot.files);
      this.sourceFileService.fillXpsDocumentPagesAsync(file, Constants.defaultDocumentScale, this.ngUnsubscribe, this.images)
        .then(_ => this.isLoading = false)
        .catch(e => {
          this.isLoading = false;
          this.images = null;
          this.error = e;
        });
      return;
    }

    if (this.sourceFileService.isImageFile(snapshot)) {
      const file = FilesSelector.getSourceFile(snapshot.files);
      if (!file) {
        this.isLoading = false;
        this.images = null;
        return;
      }

      this.sourceFileService.getImageFileToShowAsync(file, this.ngUnsubscribe)
        .then(url => {
          this.images.push(url);
          this.isLoading = false;
        })
        .catch(e => {
          this.images = null;
          this.error = e;
        });

      return;
    }

    if (this.sourceFileService.isKnownFile(snapshot)) {
      this.sourceFileService.openFileAsync(snapshot, this.ngUnsubscribe)
        .then(() => {
          this.isLoading = false;
        })
        .catch(e => {
          this.images = null;
          this.error = e;
        });
      return;
    }

    this.images = null;
    this.isLoading = false;
  }

  private cancelAllRequests(isComplete: boolean): void {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      if (isComplete) {
        this.ngUnsubscribe.complete();
      }
    }
  }

  private canNextDocument(indexOf: number): boolean {
    if (indexOf === -1) {
      return false;
    }

    if (indexOf === this.documents.length - 1) {
      return false;
    }

    return true;
  }

  private canPreviousDocument(indexOf: number): boolean {
    if (indexOf === -1) {
      return false;
    }

    if (indexOf === 0) {
      return false;
    }

    return true;
  }
}
