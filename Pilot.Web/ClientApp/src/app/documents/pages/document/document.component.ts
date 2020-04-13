import { Component, Output, Input, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { SafeUrl, Title } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, NavigationStart } from '@angular/router';
import { Location } from '@angular/common';

import { Subscription, Subject } from 'rxjs';

import { Tools } from '../../../core/tools/tools';
import { INode } from '../../shared/node.interface';
import { FilesSelector } from '../../../core/tools/files.selector';
import { SourceFileService } from '../../../core/source-file.service';
import { DownloadService } from '../../../core/download.service';
import { RepositoryService } from '../../../core/repository.service';
import { Constants } from '../../../core/constants';
import { IFileSnapshot } from '../../../core/data/data.classes';
import { VersionsSelectorService } from '../../components/document-versions/versions-selector.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
/** document component*/
export class DocumentComponent implements OnInit, OnDestroy, OnChanges {
  private versionSubscription: Subscription;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() onError = new EventEmitter<HttpErrorResponse>();
  @Output() onPreviousDocument = new EventEmitter<any>();
  @Output() onNextDocument = new EventEmitter<any>();

  @Input() document: INode;
  @Input() selectedVersion : string;

  images: SafeUrl[];
  isLoading: boolean;
  isInfoShown: boolean;

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
    private readonly versionSelector: VersionsSelectorService) {

  }

  ngOnInit(): void {
    this.versionSubscription = this.versionSelector.selectedSnapshot$.subscribe(s => {
      if (s === null)
        return;

      this.isActualVersionSelected = this.document.source.actualFileSnapshot.created === s.created;
      let version = "";
      if (!this.isActualVersionSelected)
        version = s.created;

      this.updateLocation(version);
      this.loadSnapshot(s);
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.unsubscribe();
    this.versionSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.document)
      return;

    const source = this.document.source;
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
  }

  close($event): void {
    this.onClose.emit($event);
  }

  previousDocument($event): void {
    this.onPreviousDocument.emit($event);
  }

  nextDocument($event): void {
    this.onNextDocument.emit($event);
  }

  download($event): void{
    this.downloadService.downloadFile(this.document.source);
  }

  showDocumentVersions($event): void {
    this.isInfoShown = !this.isInfoShown;
  }

  closeDocumentVersions(): void {
    this.isInfoShown = false;
  }

  selectActualVersion(): boolean {
    this.versionSelector.changeSelectedSnapshot(this.document.source.actualFileSnapshot);
    return false;
  }

  private updateLocation(version: string): void {
    let path = this.activatedRoute.snapshot.url.join("/");
    path = path + "/" + this.activatedRoute.snapshot.firstChild.url[0];
    path = path + "/" + this.document.id;
    if (version !== "")
      this.location.replaceState(path + "/" + version);
    else
      this.location.replaceState(path);
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
          this.onError.emit(e);
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
          this.onError.emit(e);
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
          this.onError.emit(e);
        });
      return;
    }

    this.images = null;
    this.isLoading = false;
  }
}
