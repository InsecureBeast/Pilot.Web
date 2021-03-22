import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { DocumentsComponent } from '../documents/documents.component';
import { DocumentListComponent } from '../../components/document-list/document-list.component';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { ActivatedRoute, Router, ParamMap, NavigationEnd, NavigationStart } from '@angular/router';
import { RepositoryService } from 'src/app/core/repository.service';
import { TypeIconService } from 'src/app/core/type-icon.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentsNavigationService } from '../../shared/documents-navigation.service';
import { DocumentsService } from '../../shared/documents.service';
import { ScrollPositionService } from 'src/app/core/scroll-position.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SearchService } from 'src/app/core/search/search.service';
import { Tools } from 'src/app/core/tools/tools';
import { Subscription } from 'rxjs';
import { IObjectNode } from '../../shared/node.interface';
import { SearchTokenAliases } from 'src/app/core/search/tokens/search-token.aliases';
import { SystemTypes } from 'src/app/core/data/system.types';
import { IType } from 'src/app/core/data/data.classes';
import { SystemIds } from 'src/app/core/data/system.ids';
import { RequestType } from 'src/app/core/headers.provider';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-documents-search',
  templateUrl: '../documents/documents.component.html',
  styleUrls: ['../documents/documents.component.css']
})
export class DocumentsSearchComponent extends DocumentsComponent implements AfterViewInit, OnInit, OnDestroy {

  private searchSubscription: Subscription;
  private activeRouteSubscription: Subscription;
  private errorSubscription: Subscription;
  private fileType: IType;
  private fileFolderType: IType;
  private previousUrl: string;

  @ViewChild('documentList') private documentList: DocumentListComponent;
  @ViewChild('breadcrumbs') private breadcrumbs: BreadcrumbsComponent;
  

  constructor(
    activatedRoute: ActivatedRoute,
    repository: RepositoryService,
    typeIconService: TypeIconService,
    translate: TranslateService,
    router: Router,
    navigationService: DocumentsNavigationService,
    documentsService: DocumentsService,
    scrollPositionService: ScrollPositionService,
    bsModalService: BsModalService,
    private readonly searchService: SearchService) {
    super(activatedRoute, repository, typeIconService, translate, router, navigationService,
      documentsService, scrollPositionService, bsModalService);

  }

  ngOnInit(): void {
    super.ngOnInit();
    const types = this.repository.getTypes();
    this.fileType = types.find(t => t.name === SystemTypes.PROJECT_FILE);
    this.fileFolderType = types.find(t => t.name === SystemTypes.PROJECT_FOLDER);
  }

  ngAfterViewInit(): void {
    Tools.sleep(10).then(() => {
      this.breadcrumbs.isDisabledInputAnimation = true;
      this.breadcrumbs.isAddSearchResultItem = true;

      this.documentList.isInitOnLoad = false;
      this.errorSubscription = this.searchService.error.subscribe(error => {
        this.documentList.isLoading = false;
        this.documentList.nodes = new Array();
        console.error(error);
      });

      this.searchSubscription = this.searchService.searchResults$.subscribe(found => {
        this.documentList.addNodes(found, false);
        this.documentList.isLoading = false;
      }, e => {
        this.documentList.isLoading = false;
        this.documentList.nodes = new Array();
        console.error(e);
      });

      this.router.events
        .pipe(filter(event => event instanceof NavigationStart))
        .subscribe((event: NavigationStart) => {
          this.previousUrl = event.url;
        });
    });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    if (this.activeRouteSubscription) {
      this.activeRouteSubscription.unsubscribe();
    }

    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }

    super.ngOnDestroy();
  }

  getEmptyImage(): string {
    return '/assets/images/empty-search.svg';
  }

  getEmptyCaption(): string {
    return this.translate.instant('searchResultsIsEmpty');
  }

  getNodeForList(): IObjectNode {
    return null;
  }

  protected onCurrentObjectLoaded(node: IObjectNode): void {
    this.documentList.parent = null;
    this.activeRouteSubscription = this.activatedRoute.queryParams.subscribe((params: ParamMap) => {
      let q = this.activatedRoute.snapshot.queryParams['q'];
      if (q) {

        this.breadcrumbs.searchInputText = q;
        const contextObjectId = node.id;

        if (this.needNavigatFromCache()) {
          this.documentList.isLoading = false;
          this.scrollPositionService.restoreScrollPosition(this.currentItem.id);
          return;
        }

        this.documentList.isLoading = true;
        this.documentList.nodes = null;

        if (node.id !== SystemIds.rootId) {
          if (node.isSource) {
            q = `${SearchTokenAliases.typeTokenAlias} ${this.fileType.title}, ${this.fileFolderType.title}; ${q}`;
          } else {
            q = `-${SearchTokenAliases.typeTokenAlias} ${this.fileType.title}, ${this.fileFolderType.title}; ${q}`;
          }
        }

        this.searchService.searchObjects(q, true, contextObjectId, this.ngUnsubscribe);
      } else {
        this.documentList.nodes = new Array();
      }
    });
  }

  private needNavigatFromCache(): boolean {
    const requestType = this.repository.getRequestType() === RequestType.FromCache;
    const nodes = this.documentList.nodes && this.documentList.nodes.length > 0;
    const route = this.previousUrl?.includes('search');
    return requestType && nodes && !route;
  }
}
