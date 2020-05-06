import { Component, Output, Input, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
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

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
/** document component*/
export class DocumentComponent implements OnInit, OnDestroy, OnChanges {
  private versionSubscription: Subscription;
  private routerSubscription: Subscription;
  private navigationSubscription: Subscription;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  private documents = new Array<string>();

  document: IObject;

  @Input() selectedVersion : string;

  images: SafeUrl[];
  isLoading: boolean;
  isInfoShown: boolean;
  error: HttpErrorResponse;

  isActualVersionSelected: boolean;
  selectedVersionCreated: string;
  selectedVersionCreator: string;
  

  /** document-details ctor */
  constructor(
    private activatedRoute: ActivatedRoute,
    private sourceFileService: SourceFileService,
    private downloadService: DownloadService,
    private location: Location,
    private repository: RepositoryService,
    private router: Router,
    private versionSelector: VersionsSelectorService) {

  }

  ngOnInit(): void {
    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (!id)
        return;

      this.loadDocument(id, true);
    });

    this.versionSubscription = this.versionSelector.selectedSnapshot$.subscribe(s => {
      if (s === null)
        return;

      if (!this.document)
        return;

      this.isActualVersionSelected = this.document.actualFileSnapshot.created === s.created;
      let version = "";
      if (!this.isActualVersionSelected)
        version = s.created;

      this.updateLocation(version);
      this.loadSnapshot(s);
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      // close your modal here
      if (event instanceof NavigationStart) {
        const startEvent = <NavigationStart>event;
        if (startEvent.navigationTrigger === 'popstate') {
          this.cancelAllRequests(false);
        }
      }

    });
  }

  ngOnDestroy(): void {
    this.cancelAllRequests(true);

    if (this.versionSubscription)
      this.versionSubscription.unsubscribe();

    if (this.routerSubscription)
      this.routerSubscription.unsubscribe();

    if (this.navigationSubscription)
      this.navigationSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    //if (!this.document)
    //  return;

    //const source = this.document.source;
    //let snapshot = source.actualFileSnapshot;
    //this.isActualVersionSelected = !this.selectedVersion;
    //if (!this.isActualVersionSelected)
    //  snapshot = source.previousFileSnapshots.find(f => f.created === this.selectedVersion);

    //if (snapshot) {
    //  this.selectedVersionCreated = Tools.toUtcCsDateTime(snapshot.created).toLocaleString();
    //  this.selectedVersionCreator = "";
    //  const creator = this.repository.getPerson(snapshot.creatorId);
    //  if (creator)
    //    this.selectedVersionCreator = creator.displayName;
    //}
    //this.loadSnapshot(snapshot);
  }

  close($event): void {
    this.cancelAllRequests(false);
    this.location.back();
  }

  download($event): void{
    this.downloadService.downloadFile(this.document);
  }

  showDocumentVersions($event): void {
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
    if (!this.canPreviousDocument(indexOf))
      return;

    const prevId = this.documents[indexOf - 1];
    this.loadDocument(prevId);
    this.updateLocation(prevId);
  }

  nextDocument(node: INode) {
    this.cancelAllRequests(false);
    const indexOf = this.documents.findIndex(doc => doc === this.document.id);
    if (!this.canNextDocument(indexOf))
      return;

    const nextId = this.documents[indexOf + 1];
    this.loadDocument(nextId);
    this.updateLocation(nextId);
  }

  private loadDocument(id: string, loadNeighbors?: boolean): void {
    this.repository.getObjectAsync(id)
      .then(source => {
        if (!source)
          return;

        this.document = source;
        let snapshot = source.actualFileSnapshot;
        this.isActualVersionSelected = !this.selectedVersion;
        if (!this.isActualVersionSelected)
          snapshot = source.previousFileSnapshots.find(f => f.created === this.selectedVersion);

        if (snapshot) {
          this.selectedVersionCreated = Tools.toUtcCsDateTime(snapshot.created).toLocaleString();
          this.selectedVersionCreator = "";
          const creator = this.repository.getPerson(snapshot.creatorId);
          if (creator)
            this.selectedVersionCreator = creator.displayName;
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
          if (type && type.hasFiles)
            this.documents.push(child.objectId);
        }
      }).catch(e => {
        this.isLoading = false;
        this.error = e;
      });
  }

  private updateLocation(id: string, version?: string): void {
    if (!version) {
      this.router.navigate(["document/" + id], { replaceUrl: true });
    } else {
      this.router.navigate(["document/" + id + "/" + version], { replaceUrl: true });
    }
  }

  private loadSnapshot(snapshot: IFileSnapshot): void {
    this.isLoading = true;
    this.images = new Array<SafeUrl>();

    if (this.sourceFileService.isXpsFile(snapshot)) {
      const file = FilesSelector.getSourceFile(snapshot.files);
      this.sourceFileService.showXpsDocumentAsync(file, Constants.defaultDocumentScale, this.ngUnsubscribe, this.images)
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
      if (isComplete)
        this.ngUnsubscribe.complete();
    }
  }

  private canNextDocument(indexOf: number): boolean {
    if (indexOf === -1)
      return false;

    if (indexOf === this.documents.length - 1)
      return false;

    return true;
  }

  private canPreviousDocument(indexOf: number): boolean {
    if (indexOf === -1)
      return false;

    if (indexOf === 0)
      return false;

    return true;
  }
}
