import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, 
  Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';

import { Subject, BehaviorSubject, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { IObject } from '../../../core/data/data.classes';
import { TypeExtensions } from '../../../core/tools/type.extensions';
import { ObjectNode } from '../../shared/object.node';
import { RepositoryService } from '../../../core/repository.service';
import { INode, IObjectNode } from '../../shared/node.interface';
import { NodeStyleService, NodeStyle } from '../../../core/node-style.service';
import { SystemIds } from '../../../core/data/system.ids';
import { RequestType } from 'src/app/core/headers.provider';
import { DocumentsService } from '../../shared/documents.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { SearchService } from 'src/app/core/search/search.service';
import { DocumentsNavigationService } from '../../shared/documents-navigation.service';

export const SearchInputSlideInToggleAnimation = [
  trigger('searchInputSlideInToggle', [
      transition(':enter', [
          style({ left: 'calc(100% - 139px)' }),
          animate('150ms ease-in')
      ]),
      transition(':leave', [
          animate('150ms ease-in', style({ left: 'calc(100% - 139px)' }))
      ])
  ])
];

export class BreadcrumbNode implements INode {

  id: string;
  parentId: string;
  title: string;
  isActive: boolean;
  isSource: boolean;
  isDocument: boolean;
  isChecked: boolean;
  isRoot: boolean;
  isSearchItem = false;

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
}

class SearchResultsBreadcrumbNode extends BreadcrumbNode {

  isSearchItem = true;
  isRoot = false;

  constructor() {
    super(null, true);
  }

  update(source: IObject): void {
  }
}

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.css'],
    animations: [SearchInputSlideInToggleAnimation]
})
/** breadcrumbs component*/
export class BreadcrumbsComponent implements OnInit, OnDestroy, OnChanges {

  private ol: ElementRef;
  private breadcrumbsCountSource = new BehaviorSubject<number>(2);
  private nodeStyleSubscription: Subscription;
  private ngUnsubscribe = new Subject<void>();
  private allBreadcrumbNodes: BreadcrumbNode[];

  @ViewChild('olRef', { static: true })
  set setOl(v: ElementRef) {
    if (!v) {
      return;
    }

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
  isAddSearchResultItem: boolean;
  searchInputText: string;
  isDisabledInputAnimation = true;

  /** breadcrumbs ctor */
  constructor(private repository: RepositoryService,
    private readonly nodeStyleService: NodeStyleService,
    private readonly documentsService: DocumentsService,
    private readonly navigationService: DocumentsNavigationService,
    private readonly searchService: SearchService) {

  }

  ngOnInit(): void {
    this.nodeStyleSubscription = this.nodeStyleService.getNodeStyle().subscribe(nodeStyle => {
      this.nodeStyle = nodeStyle;
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.nodeStyleSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.parent) {
      return;
    }

    this.init(this.parent);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (!this.ol) {
      return;
    }

    const width = this.ol.nativeElement.offsetWidth;
    this.setCountFromWidth(width);
  }

  onSelect(bc: BreadcrumbNode): void {
    this.repository.setRequestType(RequestType.New);
    this.documentsService.changeClearChecked(true);
    this.onSelected.emit(bc);
  }

  changeStyle(nodeStyle: number): void {
    if (nodeStyle === 0) {
      this.nodeStyleService.setNodeStyle(NodeStyle.ListView);
    }
    if (nodeStyle === 1) {
      this.nodeStyleService.setNodeStyle(NodeStyle.GridView);
    }
  }

  toggleSearchInput(show: boolean): void {
    this.isDisabledInputAnimation = false;
    this.searchService.isSearchInputShown = show;
  }

  search(): void {
    // todo get text from wizard
    this.navigationService.navigateToSearchDocuments(this.parent.id, this.searchInputText);
  }

  private init(item: ObjectNode) {
    if (!item) {
      return;
    }

    this.loadBreadcrumbs(item);
  }

  private loadBreadcrumbs(node: IObjectNode) {
    this.repository.getObjectParentsAsync(node.id, this.ngUnsubscribe)
      .then(parents => {
        this.allBreadcrumbNodes = new Array<BreadcrumbNode>();
        for (const parent of parents) {
          if (parent.title === 'Source files') {
            continue;
          }

          const isActive = node.id === parent.id && (node.isSource === TypeExtensions.isProjectFileOrFolder(parent.type));
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
      } else {
        list.push(breadcrumbNode);
      }
    }

    if (this.isAddSearchResultItem) {
      this.breadcrumbs = list.slice(0, 1);
      this.breadcrumbs.push(new SearchResultsBreadcrumbNode());
      this.hiddenBreadcrumbs = hiddenList;
      return;
    }

    this.breadcrumbs = list;
    this.hiddenBreadcrumbs = hiddenList;
  }

  private setCountFromWidth(width: number): void {
    if (width <= 350) {
      // this.itemWidth = 120;
      this.breadcrumbsCountSource.next(2);
      return;
    }

    if (width <= 500) {
      // this.itemWidth = 150;
      this.breadcrumbsCountSource.next(2);
      return;
    }

    if (width < 765) {
      this.breadcrumbsCountSource.next(2);
      // this.itemWidth = 250;
    } else {
      this.breadcrumbsCountSource.next(3);
      // this.itemWidth = 250;
    }
  }
}
