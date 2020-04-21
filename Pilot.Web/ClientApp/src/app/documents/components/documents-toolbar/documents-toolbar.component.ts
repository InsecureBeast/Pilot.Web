import { Component, OnInit, OnDestroy, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';

import { Subscription, Subject } from 'rxjs';

import { NodeStyleService, NodeStyle } from '../../../core/node-style.service';
import { DownloadService } from '../../../core/download.service';
import { DocumentsService } from '../../shared/documents.service';
import { INode } from '../../shared/node.interface';

@Component({
    selector: 'app-documents-toolbar',
    templateUrl: './documents-toolbar.component.html',
    styleUrls: ['./documents-toolbar.component.css', '../../shared/toolbar.css']
})

/** documents-toolbar component*/
export class DocumentsToolbarComponent implements OnInit, OnDestroy, OnChanges {

  //private ngUnsubscribe = new Subject<void>();
  @Input() checkedNodes: Array<INode>;

  /** documents-toolbar ctor */
  constructor(private readonly nodeStyleService: NodeStyleService,
    private readonly downloadService: DownloadService,
    private readonly documentsService: DocumentsService) {

  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    //for (const propName in changes) {
    //  if (changes.hasOwnProperty(propName)) {
    //    switch (propName) {
    //      case 'checkedNodes': {
    //        //this.checkedNodes(changes.currentValue)

    //    }
    //    }
    //  }
    //}
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
}
