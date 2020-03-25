import { Component, Input, Output, OnChanges, SimpleChanges, EventEmitter, OnDestroy } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

import { Subject } from 'rxjs';

import { ObjectNode } from '../../shared/object.node';
import { DownloadService } from '../../../core/download.service';

@Component({
    selector: 'app-document-toolbar',
    templateUrl: './document-toolbar.component.html',
    styleUrls: ['./document-toolbar.component.css']
})
/** document-toolbar component*/
export class DocumentToolbarComponent implements OnChanges, OnDestroy {

  private ngUnsubscribe = new Subject<void>();

  title: string;
  icon: SafeUrl;

  @Input() document: ObjectNode;
  @Output() onDocumentClosed = new EventEmitter<any>();
  @Output() onPreviousDocument = new EventEmitter<any>();
  @Output() onNextDocument = new EventEmitter<any>();

  /** document-toolbar ctor */
  constructor(private readonly downloadService: DownloadService) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.title = null;
    this.icon = null;

    if (!this.document)
      return;

    this.title = this.document.title;
    this.icon = this.document.icon;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  close($event): void {
    this.onDocumentClosed.emit($event);
  }

  download($event): void {
    this.downloadService.downloadFile(this.document.source);
  }
}
