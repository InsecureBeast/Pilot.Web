import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';

import { Subscription, Subject, BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { IObject } from '../../../core/data/data.classes';
import { TypeExtensions } from '../../../core/tools/type.extensions';
import { ObjectNode } from '../../shared/object.node';
import { RepositoryService } from '../../../core/repository.service';
import { INode } from '../../shared/node.interface';

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.css']
})
/** breadcrumbs component*/
export class BreadcrumbsComponent implements OnInit, OnDestroy, OnChanges {
  
  private ol: ElementRef;
  private breadcrumbsCountSource = new BehaviorSubject<number>(2);
  private ngUnsubscribe = new Subject<void>();
  private allBreadcrumbNodes: BreadcrumbNode[];

  @ViewChild("olRef")
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

  /** breadcrumbs ctor */
  constructor(
    private repository: RepositoryService) {

  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    //this.navigationServiceSubscription.unsubscribe();
    //this.countSubscription.unsubscribe();

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.parent)
      return;

    this.init(this.parent);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const width = this.ol.nativeElement.offsetWidth;
    this.setCountFromWidth(width);
  }

  onSelect(bc: BreadcrumbNode): void {
    this.onSelected.emit(bc);
  }

  private init(item: ObjectNode) {
    if (!item)
      return;

    //if (item.isDocument) {
      
    //  this.repository.getObjectAsync(item.parentId)
    //    .then(source => {
    //      var parent = new BreadcrumbNode(source, false);
    //      this.loadBreadcrumbs(parent);
    //    })
    //    .catch(err => {

    //    });

    //  return;
    //}

    //this.currentItem = item;
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
      this.itemWidth = 120;
      this.breadcrumbsCountSource.next(2);
      return;
    }

    if (width <= 500) {
      this.itemWidth = 150;
      this.breadcrumbsCountSource.next(2);
      return;
    }

    if (width < 765) {
      this.breadcrumbsCountSource.next(2);
      this.itemWidth = 250;
    } else {
      this.breadcrumbsCountSource.next(3);
      this.itemWidth = 250;
    }
  }
}

export class BreadcrumbNode implements INode {

  source: IObject;

  /** BreadcrumbNode ctor */
  constructor(source: IObject, isActive: boolean) {
    this.id = source.id;
    this.title = source.title;
    this.isActive = isActive;
    this.isDocument = false;
    this.parentId = source.parentId;
    this.isSource = TypeExtensions.isProjectFileOrFolder(source.type);
    this.source = source;
  }

  id: string;
  parentId: string;
  title: string;
  isActive: boolean;
  isSource: boolean;
  isDocument: boolean;
}
