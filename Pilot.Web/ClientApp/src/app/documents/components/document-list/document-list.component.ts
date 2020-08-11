import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, AfterViewChecked, HostListener } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, NavigationStart, Scroll } from '@angular/router';

import { Subscription, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { RepositoryService } from '../../../core/repository.service';
import { ObjectNode, EmptyObjectNode } from "../../shared/object.node";
import { ChildrenType } from '../../../core/data/children.types';
import { IObject } from '../../../core/data/data.classes';
import { NodeStyle, NodeStyleService } from '../../../core/node-style.service';
import { TypeIconService } from '../../../core/type-icon.service';
import { INode, IObjectNode } from '../../shared/node.interface';
import { DownloadService } from '../../../core/download.service';
import { DocumentsService } from '../../shared/documents.service';
import { RequestType } from 'src/app/core/headers.provider';

@Component({
    selector: 'app-document-list',
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.css']
})
/** documents-list component*/
export class DocumentListComponent implements OnInit, OnDestroy, OnChanges, AfterViewChecked {
  private routerSubscription: Subscription;
  private nodeStyleServiceSubscription: Subscription;
  private checkedNodesSubscription: Subscription;
  private ngUnsubscribe = new Subject<void>();

  @Input() parent: ObjectNode;

  @Output() onChecked = new EventEmitter<IObjectNode[]>();
  @Output() onSelected = new EventEmitter<INode>();
  @Output() onError = new EventEmitter<HttpErrorResponse>();
  @Output() onLoaded = new EventEmitter<INode>();

  nodeStyle: NodeStyle;
  nodes: IObjectNode[];
  isLoading: boolean;
  isAnyItemChecked: boolean;
  isLoaded: boolean;

  /** documents-list ctor */
  constructor(
    private repository: RepositoryService,
    private downloadService: DownloadService,
    private nodeStyleService: NodeStyleService,
    private typeIconService: TypeIconService,
    private translate: TranslateService,
    private documentsService: DocumentsService,
    private router: Router) {

  }

  ngOnChanges(changes: SimpleChanges): void {

    if (!this.parent)
      return;

    this.isLoaded = false;

    // or get item from changes
    this.cancelAllRequests(false);
    this.init(this.parent);
  }

  ngOnInit(): void {
    this.checkedNodesSubscription = this.documentsService.clearChecked.subscribe(v => {
      if (v)
        this.clearChecked();
    });

    this.nodeStyleServiceSubscription = this.nodeStyleService.getNodeStyle().subscribe(value => {
      this.nodeStyle = value;

      if (!this.nodes)
        return;

      for (let node of this.nodes) {
        node.loadPreview();
      }
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const startEvent = <NavigationStart>event;
        if (startEvent.navigationTrigger === 'popstate') {
          this.cancelAllRequests(false);
          this.repository.requestType = RequestType.FromCache;
        }
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.isLoaded) {
      this.onLoaded.emit(this.parent);
      this.isLoaded = false;
    }
  }

  ngOnDestroy(): void {
    if (this.nodeStyleServiceSubscription)
      this.nodeStyleServiceSubscription.unsubscribe();

    if (this.routerSubscription)
      this.routerSubscription.unsubscribe();

    if (this.checkedNodesSubscription)
      this.checkedNodesSubscription.unsubscribe();

    this.cancelAllRequests(true);
  }

  selected(item: IObjectNode): void {
    if (!item.id)
      return;

    this.repository.requestType = RequestType.New;
    this.clearChecked();
    this.nodes = null;
    this.onSelected.emit(item);
  }

  checked(node: IObjectNode, event: MouseEvent): void {
    if (!node.id)
      return;

    if (!event.ctrlKey) {
      this.clearChecked();
    }

    node.isChecked = !node.isChecked;
    this.isAnyItemChecked = true;

    const checked = this.nodes.filter(n => n.isChecked);
    this.onChecked.emit(checked);
  }

  addChecked(node: IObjectNode): void {
    node.isChecked = !node.isChecked;
    this.isAnyItemChecked = true;

    const checked = this.nodes.filter(n => n.isChecked);
    this.onChecked.emit(checked);

    if (checked.length === 0)
      this.isAnyItemChecked = false;
  }

  downloadDocument(node: IObjectNode) {
    this.downloadService.downloadFile(node.source);
  }

  isEmptyNode(node: IObjectNode): boolean {
    return node instanceof EmptyObjectNode;
  }

  private init(item: IObjectNode) {
    this.nodes = null;
    this.nodes = new Array();
    for (let i = 0; i < item.children.length; i++) {
      this.nodes.push(new EmptyObjectNode());
    }
    this.isLoaded = true;
    this.loadChildren(item.id, item.isSource);
  }

  private loadChildren(id: string, isSource: boolean) {
    let type = ChildrenType.ListView;
    if (isSource)
      type = ChildrenType.Storage;

    this.repository.getChildrenAsync(id, type, this.ngUnsubscribe)
      .then(nodes => {
        this.isLoading = false;
        this.addNodes(nodes, isSource);
        this.onChecked.emit(null);
      })
      .catch(e => {
        this.onError.emit(e);
        this.isLoading = false;
      });
  }

  private addNodes(documents: IObject[], isSource: boolean): void {
    this.nodes = new Array<ObjectNode>();
    for (let doc of documents) {
      if (doc.type.name === "Root_object_type") // todo: filter not available items
        continue;

      const node = new ObjectNode(doc, isSource, this.typeIconService, this.ngUnsubscribe, this.translate);
      this.nodes.push(node);
    }
  }

  private clearChecked(): void {
    if (this.nodes) {
      for (let node of this.nodes) {
        node.isChecked = false;
      }
    }

    this.isAnyItemChecked = false;
    this.onChecked.emit(null);
  }

  private cancelAllRequests(isCompleted: boolean): void {
    if (this.ngUnsubscribe) {
      // This aborts all HTTP requests.
      this.ngUnsubscribe.next();
      // This completes the subject properly.
      if (isCompleted)
        this.ngUnsubscribe.complete();
    }
  }
}
