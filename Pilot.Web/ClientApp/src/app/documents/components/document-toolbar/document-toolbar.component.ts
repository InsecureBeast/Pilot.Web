import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { SafeUrl} from '@angular/platform-browser';

import { Subject } from 'rxjs';

import { IObject } from '../../../core/data/data.classes';

@Component({
    selector: 'app-document-toolbar',
    templateUrl: './document-toolbar.component.html',
    styleUrls: ['./document-toolbar.component.css', '../../shared/toolbar.css']
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

  @Output() documentClosed = new EventEmitter<any>();
  @Output() documentDownloaded = new EventEmitter<any>();
  @Output() moreShown = new EventEmitter<any>();
  @Output() documentCardOpened = new EventEmitter<any>();
  @Output() filesShown = new EventEmitter<boolean>();

  /** document-toolbar ctor */
  constructor() {

  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  close($event): void {
    this.documentClosed.emit($event);
  }

  download($event): void {
    this.documentDownloaded.emit($event);
  }

  showMore($event): void {
    this.isVersionsChecked = !this.isVersionsChecked;
    this.moreShown.emit(this.document);
  }

  openDocumentCard(): void {
    this.documentCardOpened.emit();
  }

  showFiles(): void {
    this.showFilesMode = !this.showFilesMode;
    this.filesShown.emit(this.showFilesMode);
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
