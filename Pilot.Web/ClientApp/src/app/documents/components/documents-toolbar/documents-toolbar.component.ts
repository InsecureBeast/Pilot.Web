import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription, Subject } from 'rxjs';

import { NodeStyleService, NodeStyle } from '../../../core/node-style.service';
import ListView = NodeStyle.ListView;
import GridView = NodeStyle.GridView;

@Component({
    selector: 'app-documents-toolbar',
    templateUrl: './documents-toolbar.component.html',
    styleUrls: ['./documents-toolbar.component.css', '../../shared/toolbar.css']
})

/** documents-toolbar component*/
export class DocumentsToolbarComponent implements OnInit, OnDestroy {

  //private ngUnsubscribe = new Subject<void>();
  private nodeStyleSubscription: Subscription;

  nodeStyle: NodeStyle;

  /** documents-toolbar ctor */
  constructor(private readonly nodeStyleService: NodeStyleService) {

  }

  ngOnInit(): void {
    this.nodeStyleSubscription = this.nodeStyleService.getNodeStyle().subscribe(style => {
      this.nodeStyle = style;
    });
  }

  ngOnDestroy(): void {
    this.nodeStyleSubscription.unsubscribe();
  }

  changeStyle(style: number): void {
    if (style === 0)
      this.nodeStyleService.setNodeStyle(ListView);
    if (style === 1)
      this.nodeStyleService.setNodeStyle(GridView);
  }
}
