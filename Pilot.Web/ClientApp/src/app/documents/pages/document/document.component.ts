import { Component, Output, Input, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { SafeUrl, Title } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, NavigationStart } from '@angular/router';

import { Subscription, Subject } from 'rxjs';

import { INode } from '../../shared/node.interface';
import { FilesSelector } from '../../../core/tools/files.selector';
import { SourceFileService } from '../../../core/source-file.service';
import { DownloadService } from '../../../core/download.service';
import { Constants } from '../../../core/constants';
import { ModalService } from '../../../ui/modal/modal.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
/** document component*/
export class DocumentComponent implements OnInit, OnDestroy, OnChanges {

  //private routeSubscription: Subscription;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() onError = new EventEmitter<HttpErrorResponse>();
  @Output() onPreviousDocument = new EventEmitter<any>();
  @Output() onNextDocument = new EventEmitter<any>();

  @Input() document: INode;

  images: SafeUrl[];
  isLoading: boolean;
  isInfoShown: boolean;

  /** document-details ctor */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly sourceFileService: SourceFileService,
    private readonly downloadService: DownloadService,
    private readonly modalService: ModalService,) {

  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.document)
      return;

    const source = this.document.source;
    this.isLoading = true;
    this.images = new Array<SafeUrl>();

    if (this.sourceFileService.isXpsFile(source)) {
      const file = FilesSelector.getSourceFile(source.actualFileSnapshot.files);
      this.sourceFileService.showXpsDocumentAsync(file, Constants.defaultDocumentScale, this.ngUnsubscribe, this.images)
        .then(_ => this.isLoading = false)
        .catch(e => {
          this.isLoading = false;
          this.images = null;
          this.onError.emit(e);
        });
      return;
    }

    if (this.sourceFileService.isImageFile(source)) {
      const file = FilesSelector.getSourceFile(source.actualFileSnapshot.files);
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

    if (this.sourceFileService.isKnownFile(source)) {
      this.sourceFileService.openFileAsync(source, this.ngUnsubscribe)
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
}
