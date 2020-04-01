import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Subscription, Subject } from 'rxjs';

import { NodeStyleService, NodeStyle } from '../../../core/node-style.service';
import { DownloadService } from '../../../core/download.service';
import { INode } from '../../shared/node.interface';


@Component({
    selector: 'app-documents-toolbar',
    templateUrl: './documents-toolbar.component.html',
    styleUrls: ['./documents-toolbar.component.css', '../../shared/toolbar.css']
})

/** documents-toolbar component*/
export class DocumentsToolbarComponent implements OnInit, OnDestroy, OnChanges {

  //private ngUnsubscribe = new Subject<void>();
  private nodeStyleSubscription: Subscription;

  @Input() checkedNodes: Array<INode>;

  nodeStyle: NodeStyle;

  /** documents-toolbar ctor */
  constructor(private readonly nodeStyleService: NodeStyleService,
    private readonly downloadService: DownloadService) {

  }

  ngOnInit(): void {
    this.nodeStyleSubscription = this.nodeStyleService.getNodeStyle().subscribe(style => {
      this.nodeStyle = style;
    });
  }

  ngOnDestroy(): void {
    this.nodeStyleSubscription.unsubscribe();
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

  changeStyle(style: number): void {
    if (style === 0)
      this.nodeStyleService.setNodeStyle(NodeStyle.ListView);
    if (style === 1)
      this.nodeStyleService.setNodeStyle(NodeStyle.GridView);
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
    if (this.checkedNodes.length !== 1)
      return false;

    return this.checkedNodes[0].isDocument;
  }
}
