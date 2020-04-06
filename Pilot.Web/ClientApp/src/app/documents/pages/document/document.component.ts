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
    //this.routeSubscription = this.route.paramMap.subscribe((params: ParamMap) => {

    //});
    //this.navigationServiceSubscription = this.navigationService.currentObject.subscribe(document => {
    //  this._document = document;
    //  this.init(document);
    //});
  }

  ngOnDestroy(): void {
    //this.routeSubscription.unsubscribe();
    this.ngUnsubscribe.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.document)
      return;

    const source = this.document.source;
    this.images = null;

    if (this.sourceFileService.isXpsFile(source)) {
      this.isLoading = true;
      const file = FilesSelector.getSourceFile(source.actualFileSnapshot.files);
      this.images = new Array<SafeUrl>();
      this.sourceFileService.showXpsDocumentAsync(file, Constants.defaultDocumentScale, this.ngUnsubscribe, this.images)
        .then(_ => this.isLoading = false)
        .catch(e => {
          this.isLoading = false;
          this.onError.emit(e);
        });
      return;
    }
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
