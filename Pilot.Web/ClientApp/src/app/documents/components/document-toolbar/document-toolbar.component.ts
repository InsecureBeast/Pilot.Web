import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { SafeUrl} from '@angular/platform-browser';

import { Subject } from 'rxjs';

import { IObject } from '../../../core/data/data.classes';

@Component({
    selector: 'app-document-toolbar',
    templateUrl: './document-toolbar.component.html',
    styleUrls: ['./document-toolbar.component.css', '../../../ui/toolbar.css']
})
/** document-toolbar component*/
export class DocumentToolbarComponent implements OnDestroy {

  private ngUnsubscribe = new Subject<void>();

  title: string;
  icon: SafeUrl;
  canShowFiles: boolean;
  isVersionsChecked: boolean;
  showFilesMode = false;

  @Input()
  set document(value: IObject) {
    this.documentChanged(value);
  }

  @Output() onDocumentClosed = new EventEmitter<any>();
  @Output() onDownload = new EventEmitter<any>();
  @Output() onPreviousDocument = new EventEmitter<any>();
  @Output() onNextDocument = new EventEmitter<any>();
  @Output() onShowVersions = new EventEmitter<any>();
  @Output() onShowDocumentCard = new EventEmitter<any>();
  @Output() onShowFiles = new EventEmitter<boolean>();

  /** document-toolbar ctor */
  constructor() {

  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  previous($event): void {
    this.onPreviousDocument.emit();
  }

  next($event): void {
    this.onNextDocument.emit();
  }

  close($event): void {
    this.onDocumentClosed.emit($event);
  }

  download($event): void {
    this.onDownload.emit($event);
  }

  showVersions($event): void {
    this.isVersionsChecked = !this.isVersionsChecked;
    this.onShowVersions.emit(this.document);
  }

  openDocumentCard(): void {
    this.onShowDocumentCard.emit();
  }

  showFiles(): void {
    this.showFilesMode = !this.showFilesMode;
    this.onShowFiles.emit(this.showFilesMode);
  }

  private documentChanged(document: IObject): void {
    this.title = null;
    this.icon = null;

    if (!document) {
      return;
    }

    this.title = document.title;
    this.icon = document.type.icon;
    this.canShowFiles = document.type.isMountable;
  }
}
