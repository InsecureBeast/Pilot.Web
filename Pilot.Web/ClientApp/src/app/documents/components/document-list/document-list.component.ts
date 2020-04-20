import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, AfterViewChecked, ElementRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Subscription, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { RepositoryService } from '../../../core/repository.service';
import { ObjectNode } from "../../shared/object.node";
import { ChildrenType } from '../../../core/data/children.types';
import { IObject } from '../../../core/data/data.classes';
import { NodeStyle, NodeStyleService } from '../../../core/node-style.service';
import { TypeIconService } from '../../../core/type-icon.service';
import { INode } from '../../shared/node.interface';
import { DownloadService } from '../../../core/download.service';
import { DocumentsService } from '../../shared/documents.service';

@Component({
    selector: 'app-document-list',
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.css']
})
/** documents-list component*/
export class DocumentListComponent implements OnInit, OnDestroy, OnChanges, AfterViewChecked {

  private nodeStyleServiceSubscription: Subscription;
  private checkedNodesSubscription: Subscription;
  private ngUnsubscribe = new Subject<void>();

  @Input() parent: ObjectNode;
  @Input() documents: Array<INode>;

  @Output() onChecked = new EventEmitter<ObjectNode[]>();
  @Output() onSelected = new EventEmitter<INode>();
  @Output() onError = new EventEmitter<HttpErrorResponse>();
  @Output() onLoaded = new EventEmitter<INode>();

  nodeStyle: NodeStyle;
  nodes: ObjectNode[];
  isLoading: boolean;
  isAnyItemChecked: boolean;
  isLoaded: boolean;

  /** documents-list ctor */
  constructor(
    private readonly repository: RepositoryService,
    private readonly downloadService: DownloadService,
    private readonly nodeStyleService: NodeStyleService,
    private readonly typeIconService: TypeIconService,
    private readonly translate: TranslateService,
    private readonly documentsService: DocumentsService,
    public element: ElementRef) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.parent)
      return;

    this.isLoaded = false;

    // or get item from changes
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

    if (this.ngUnsubscribe) {
      // This aborts all HTTP requests.
      this.ngUnsubscribe.next();
      // This completes the subject properly.
      this.ngUnsubscribe.complete();
    }

    this.checkedNodesSubscription.unsubscribe();
  }

  selected(item: ObjectNode): void {
    this.clearChecked();
    this.onSelected.emit(item);
  }

  checked(node: ObjectNode, event: MouseEvent): void {
    if (!event.ctrlKey) {
      this.clearChecked();
    }

    node.isChecked = !node.isChecked;
    this.isAnyItemChecked = true;

    const checked = this.nodes.filter(n => n.isChecked);
    this.onChecked.emit(checked);
  }

  addChecked(node: ObjectNode): void {
    node.isChecked = !node.isChecked;
    this.isAnyItemChecked = true;

    const checked = this.nodes.filter(n => n.isChecked);
    this.onChecked.emit(checked);

    if (checked.length === 0)
      this.isAnyItemChecked = false;
  }

  downloadDocument(node: ObjectNode) {
    this.downloadService.downloadFile(node.source);
  }

  private init(item: ObjectNode) {
    this.nodes = null;
    this.isLoading = true;
    this.loadChildren(item.id, item.isSource);
  }

  private loadChildren(id: string, isSource: boolean) {
    let type = ChildrenType.ListView;
    if (isSource)
      type = ChildrenType.Storage;

    if (this.ngUnsubscribe) {
      // This aborts all HTTP requests.
      this.ngUnsubscribe.next();
    }

    this.repository.getChildrenAsync(id, type, this.ngUnsubscribe)
      .then(nodes => {
        this.isLoading = false;
        this.addNodes(nodes, isSource);
        this.isLoaded = true;
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

      if (!this.documents)
        continue;;

      if (node.isDocument)
        this.documents.push(node);
    }
  }

  private clearChecked(): void {
    for (let node of this.nodes) {
      node.isChecked = false;
    }

    this.isAnyItemChecked = false;
  }
}
