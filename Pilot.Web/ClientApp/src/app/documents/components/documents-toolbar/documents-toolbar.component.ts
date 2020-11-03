import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { DownloadService } from '../../../core/download.service';
import { DocumentsService } from '../../shared/documents.service';
import { INode } from '../../shared/node.interface';

@Component({
    selector: 'app-documents-toolbar',
    templateUrl: './documents-toolbar.component.html',
    styleUrls: ['./documents-toolbar.component.css', '../../../ui/toolbar.css']
})

/** documents-toolbar component*/
export class DocumentsToolbarComponent implements OnInit, OnDestroy {

  @Input() checkedNodes: INode[];
  @Output() onShowDocumentCard = new EventEmitter<any>();

  /** documents-toolbar ctor */
  constructor(
    private readonly downloadService: DownloadService,
    private readonly documentsService: DocumentsService) {

  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    
  }

  download(): void {
    if (!this.checkedNodes)
      return;

    const selected = this.checkedNodes[0];
    this.downloadService.downloadFile(selected.source);
  }

  downloadArchive(): void {
    if (!this.checkedNodes)
      return;

    const selected = this.checkedNodes.map(n => n.id);
    this.downloadService.downloadFileArchive(selected);
  }

  isNodeChecked(): boolean {
    return this.checkedNodes && this.checkedNodes.length > 0;
  }

  isDocumentChecked(): boolean {
    if (!this.checkedNodes)
      return false;
    if (this.checkedNodes.length !== 1)
      return false;

    return this.checkedNodes[0].isDocument;
  }

  clearChecked(): void {
    this.documentsService.changeClearChecked(true);
    this.checkedNodes = new Array();
  }

  openDocumentCard() : void {
    this.onShowDocumentCard.emit();
  }
}
