import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, 
  Input, Output, EventEmitter } from '@angular/core';

import { Subject, Subscription } from 'rxjs';

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
import { Tools } from 'src/app/core/tools/tools';
import { BreadcrumbNode, SearchResultsBreadcrumbNode } from './breadcrumb.node';

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

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.css'],
    animations: [SearchInputSlideInToggleAnimation]
})
/** breadcrumbs component*/
export class BreadcrumbsComponent implements OnInit, OnDestroy {

  private ol: ElementRef;
  private nodeStyleSubscription: Subscription;
  private ngUnsubscribe = new Subject<void>();
  private _toolsPanel: ElementRef;
  private _parent: ObjectNode;

  @ViewChild('olRef', { static: true })
  set setOl(v: ElementRef) {
    this.ol = v;
  }

  @ViewChild('toolsPanel', { static: true })
  set setToolsPanel(v: ElementRef) {
    this._toolsPanel = v;
  }

  @Input()
  set parent(value: ObjectNode) {
    this._parent = value;
    this.init(value);
  }
  get parent(): ObjectNode {
    return this._parent;
  }

  @Output() onSelected = new EventEmitter<INode>();

  breadcrumbs: BreadcrumbNode[];
  hiddenBreadcrumbs: BreadcrumbNode[];
  allBreadcrumbNodes: BreadcrumbNode[];
  itemWidth: number;
  nodeStyle: NodeStyle;
  isAddSearchResultItem: boolean;
  searchInputText: string;
  isDisabledInputAnimation = true;
  isSearchInputFocused: boolean;
  root: BreadcrumbNode;

  /** breadcrumbs ctor */
  constructor(private repository: RepositoryService,
    private readonly nodeStyleService: NodeStyleService,
    private readonly documentsService: DocumentsService,
    private readonly navigationService: DocumentsNavigationService,
    public readonly searchService: SearchService) {

    this.allBreadcrumbNodes = new Array<BreadcrumbNode>();
    this.hiddenBreadcrumbs = new Array<BreadcrumbNode>();
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

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (!this.ol) {
      return;
    }

    Tools.sleep(0).then(() => {
      this.reorder();
    });
  }

  onSelect(bc: BreadcrumbNode): void {
    this.repository.setRequestType(RequestType.New);
    this.documentsService.changeClearChecked(true);
    this.onSelected.emit(bc);
  }

  changeStyle(nodeStyle: number): boolean {
    if (nodeStyle === 0) {
      this.nodeStyleService.setNodeStyle(NodeStyle.ListView);
    }
    if (nodeStyle === 1) {
      this.nodeStyleService.setNodeStyle(NodeStyle.GridView);
    }

    return true;
  }

  toggleSearchInput(show: boolean): boolean {
    this.isDisabledInputAnimation = false;
    this.searchService.isSearchInputShown = show;
    Tools.sleep(200).then(() => {
      this.isSearchInputFocused = show;
    });

    return true;
  }

  search(): boolean {
    // todo get text from wizard
    const q = this.searchInputText;
    this.repository.setRequestType(RequestType.New);
    if (this.parent.isSource) {
      this.navigationService.navigateToSearchFiles(this.parent.id, this.searchInputText);
      return true;
    }

    this.navigationService.navigateToSearchDocuments(this.parent.id, this.searchInputText);
    return true;
  }

  private reorder() {
    const list = new Array<BreadcrumbNode>();
    const hiddenList = new Array<BreadcrumbNode>();
    const loadedBreadcrumbs = this.allBreadcrumbNodes;

    let wb = 0; // this.breadcrumbs.length; // cumulative width for breadcrumbs with separators
    const w = window.innerWidth;
    const f = 40; // fixed witdth for home button
    const a = 56; // fixed size for hidden breadcrumbs button
    const s = this._toolsPanel.nativeElement.offsetWidth + 40; // fixed size for search button and style button

    let wa = 0; // available space for breadcrumbs
    wa = w - f - s - a;

    for (let i = 0; i < loadedBreadcrumbs.length; i++) {
      const breadcrumbNode = loadedBreadcrumbs[i];
      if (this.isAddSearchResultItem) {
        breadcrumbNode.isActive = false;
      }

      wb += breadcrumbNode.width;
      if (wb < wa) {
        list.splice(0, 0, breadcrumbNode);
      } else {
        hiddenList.splice(0, 0, breadcrumbNode);
      }
    }

    if (this.isAddSearchResultItem) {
      if (list.length > 1) {
        this.breadcrumbs = list.slice(1, 2);
      } else {
        this.breadcrumbs = list;
      }
      this.breadcrumbs.push(new SearchResultsBreadcrumbNode());
      this.hiddenBreadcrumbs = hiddenList;
      return;
    }

    this.breadcrumbs = list;
    this.hiddenBreadcrumbs = hiddenList;
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

          if (parent.id === SystemIds.rootId) {
            this.root = new BreadcrumbNode(parent, isActive);
            continue;
          }

          this.allBreadcrumbNodes.push(new BreadcrumbNode(parent, isActive));
        }

        this.allBreadcrumbNodes.reverse();

        Tools.sleep(0).then(() => {
          this.reorder();
        });
      });
  }
}
