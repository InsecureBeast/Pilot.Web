import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
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

@Component({
    selector: 'app-document-list',
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.css']
})
/** documents-list component*/
export class DocumentListComponent implements OnInit, OnDestroy, OnChanges{

  private nodeStyleServiceSubscription: Subscription;
  private ngUnsubscribe = new Subject<void>();

  @Input() parent: ObjectNode;
  @Input() documents: Array<INode>;

  @Output() onChecked = new EventEmitter<ObjectNode[]>();
  @Output() onSelected = new EventEmitter<INode>();
  @Output() onError = new EventEmitter<HttpErrorResponse>();

  nodeStyle: NodeStyle;
  nodes: ObjectNode[];
  isLoading: boolean;

  /** documents-list ctor */
  constructor(
    private readonly repository: RepositoryService,
    private readonly downloadService: DownloadService,
    private readonly nodeStyleService: NodeStyleService,
    private readonly typeIconService: TypeIconService,
    private readonly translate: TranslateService) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.parent)
      return;

    // or get item from changes
    this.init(this.parent);

    this.nodeStyleServiceSubscription = this.nodeStyleService.getNodeStyle().subscribe(value => {
      this.nodeStyle = value;

      if (!this.nodes)
        return;

      for (let node of this.nodes) {
        node.loadTypeIcon();
      }
    });
  }

  ngOnInit(): void {
    //this.navigationServiceSubscription = this.navigationService.currentObject.subscribe(item => {
    //  if (!item)
    //    return;

    //  if (item.isDocument) {
    //    if (this.currentItem)
    //      return;

    //    // TODO load parent nodes
    //    this.repository.getObjectAsync(item.parentId)
    //      .then(source => {
    //        var parent = new ObjectNode(source, item.isSource, this.typeIconService, this.ngUnsubscribe, this.translate);
    //        this.init(parent);

    //      })
    //      .catch(err => {
    //        this.onError.emit(err);
    //        this.isLoading = false;
    //      });

    //    return;
    //  }

    //  this.init(item);
    //});
  }

  ngOnDestroy(): void {
    //this.navigationServiceSubscription.unsubscribe();
    if (this.nodeStyleServiceSubscription)
      this.nodeStyleServiceSubscription.unsubscribe();

    if (this.ngUnsubscribe) {
      // This aborts all HTTP requests.
      this.ngUnsubscribe.next();
      // This completes the subject properly.
      this.ngUnsubscribe.complete();
    }
  }

  selected(item: ObjectNode): void {
    //this.navigationService.navigateTo(item);
    this.onSelected.emit(item);
  }

  checked(node: ObjectNode, event: MouseEvent): void {

    if (!event.ctrlKey) {
      for (let node of this.nodes) {
        node.isChecked = false;
      }
    }

    node.isChecked = !node.isChecked;
    this.onChecked.emit(this.nodes);
  }

  downloadDocument(node: ObjectNode) {
    this.downloadService.downloadFile(node.source);
  }

  private init(item: ObjectNode) {
    this.nodes = null;
    //this.currentItem = item;
    this.isLoading = true;
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
        this.onChecked.emit(this.nodes);
        //this.dataService.changeCurrentNodes(this.nodes);
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
}
