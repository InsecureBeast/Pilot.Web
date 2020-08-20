import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';

import { Subject, BehaviorSubject, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { IObject } from '../../../core/data/data.classes';
import { TypeExtensions } from '../../../core/tools/type.extensions';
import { ObjectNode } from '../../shared/object.node';
import { RepositoryService } from '../../../core/repository.service';
import { INode } from '../../shared/node.interface';
import { NodeStyleService, NodeStyle } from '../../../core/node-style.service';
import { SystemIds } from '../../../core/data/system.ids';
import { RequestType } from 'src/app/core/headers.provider';

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.css']
})
/** breadcrumbs component*/
export class BreadcrumbsComponent implements OnInit, OnDestroy, OnChanges {
  
  private ol: ElementRef;
  private breadcrumbsCountSource = new BehaviorSubject<number>(2);
  private nodeStyleSubscription: Subscription;

  private ngUnsubscribe = new Subject<void>();
  private allBreadcrumbNodes: BreadcrumbNode[];

  @ViewChild("olRef", { static: true })
  set setOl(v: ElementRef) {
    if (!v)
      return;

    this.ol = v;
    const width = v.nativeElement.offsetWidth;
    this.setCountFromWidth(width);
  }

  @Input() parent: ObjectNode;
  @Output() onSelected = new EventEmitter<INode>();

  breadcrumbs: BreadcrumbNode[];
  hiddenBreadcrumbs: BreadcrumbNode[];
  itemWidth: number;
  nodeStyle: NodeStyle;

  /** breadcrumbs ctor */
  constructor(private repository: RepositoryService,
  private readonly nodeStyleService: NodeStyleService) {

  }

  ngOnInit(): void {
    this.nodeStyleSubscription = this.nodeStyleService.getNodeStyle().subscribe(style => {
      this.nodeStyle = style;
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.nodeStyleSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.parent)
      return;

    this.init(this.parent);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (!this.ol)
      return;

    const width = this.ol.nativeElement.offsetWidth;
    this.setCountFromWidth(width);
  }

  onSelect(bc: BreadcrumbNode): void {
    this.repository.requestType = RequestType.New;
    this.onSelected.emit(bc);
  }

  changeStyle(style: number): void {
    if (style === 0)
      this.nodeStyleService.setNodeStyle(NodeStyle.ListView);
    if (style === 1)
      this.nodeStyleService.setNodeStyle(NodeStyle.GridView);
  }

  private init(item: ObjectNode) {
    if (!item)
      return;

    this.loadBreadcrumbs(item);
  }

  private loadBreadcrumbs(node: ObjectNode) {
    this.repository.getObjectParentsAsync(node.id, this.ngUnsubscribe)
      .then(parents => {
        this.allBreadcrumbNodes = new Array<BreadcrumbNode>();
        for (let parent of parents) {
          if (parent.title === "Source files")
            continue;

          let isActive = node.id === parent.id && (node.isSource === TypeExtensions.isProjectFileOrFolder(parent.type));
          this.allBreadcrumbNodes.push(new BreadcrumbNode(parent, isActive));
        }

        this.breadcrumbsCountSource.pipe(first()).subscribe(value => {
          this.refillBreadcrumbs(value);
        });
      });
  }

  private refillBreadcrumbs(count: number): void {
    const list = new Array<BreadcrumbNode>();
    const hiddenList = new Array<BreadcrumbNode>();
    const loadedBreadcrumbs = this.allBreadcrumbNodes;
    for (let i = 0; i < loadedBreadcrumbs.length; i++) {
      const breadcrumbNode = loadedBreadcrumbs[i];
      if (i < loadedBreadcrumbs.length - count) {
        hiddenList.push(breadcrumbNode);
      }
      else {
        list.push(breadcrumbNode);
      }
    }

    this.breadcrumbs = list;
    this.hiddenBreadcrumbs = hiddenList;
  }

  private setCountFromWidth(width: number): void {
    if (width <= 350) {
      //this.itemWidth = 120;
      this.breadcrumbsCountSource.next(2);
      return;
    }

    if (width <= 500) {
      //this.itemWidth = 150;
      this.breadcrumbsCountSource.next(2);
      return;
    }

    if (width < 765) {
      this.breadcrumbsCountSource.next(2);
      //this.itemWidth = 250;
    }
    else {
      this.breadcrumbsCountSource.next(3);
      //this.itemWidth = 250;
    }
  }
}

export class BreadcrumbNode implements INode {

  /** BreadcrumbNode ctor */
  constructor(public source: IObject, isActive: boolean) {
    this.update(source);
    this.isActive = isActive;
  }

  update(source: IObject): void {
    this.source = source;
    this.id = source.id;
    this.title = source.title;
    this.isDocument = false;
    this.parentId = source.parentId;
    this.isSource = TypeExtensions.isProjectFileOrFolder(source.type);
    this.source = source;
    this.isRoot = source.id === SystemIds.rootId;
  }

  id: string;
  parentId: string;
  title: string;
  isActive: boolean;
  isSource: boolean;
  isDocument: boolean;
  isChecked: boolean;
  isRoot: boolean;
}
