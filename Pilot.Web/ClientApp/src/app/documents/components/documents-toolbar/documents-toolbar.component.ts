import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { DownloadService } from '../../../core/download.service';
import { DocumentsService } from '../../shared/documents.service';
import { INode } from '../../shared/node.interface';

@Component({
    selector: 'app-documents-toolbar',
    templateUrl: './documents-toolbar.component.html',
    styleUrls: ['./documents-toolbar.component.css', '../../shared/toolbar.css']
})

/** documents-toolbar component*/
export class DocumentsToolbarComponent implements OnInit, OnDestroy {

  @Input() checkedNodes: INode[];
  @Output() onShowDocumentCard = new EventEmitter<any>();
  @Output() downloadStarted = new EventEmitter<any>();
  @Output() downloadFinished = new EventEmitter<any>();

  /** documents-toolbar ctor */
  constructor(
    private readonly downloadService: DownloadService,
    private readonly documentsService: DocumentsService) {

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

  async download(): Promise<void> {
    if (!this.checkedNodes) {
      return;
    }

    this.downloadStarted.emit();
    const selected = this.checkedNodes[0];
    await this.downloadService.downloadFile(selected.source);
    this.downloadFinished.emit();
  }

  downloadArchive(): void {
    if (!this.checkedNodes) {
      return;
    }

    this.downloadStarted.emit();
    const selected = this.checkedNodes.map(n => n.id);
    this.downloadService.downloadFileArchive(selected);
    this.downloadFinished.emit();
  }

  isNodeChecked(): boolean {
    return this.checkedNodes && this.checkedNodes.length > 0;
  }

  isDocumentChecked(): boolean {
    if (!this.checkedNodes) {
      return false;
    }
    if (this.checkedNodes.length !== 1) {
      return false;
    }

    return this.checkedNodes[0].isDocument;
  }

  clearChecked(): void {
    this.documentsService.changeClearChecked(true);
    this.checkedNodes = new Array();
  }

  openDocumentCard(): void {
    this.onShowDocumentCard.emit();
  }
}
