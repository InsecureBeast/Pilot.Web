import { Component, ViewChild, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { DocumentsComponent } from '../documents/documents.component';
import { DocumentListComponent } from '../../components/document-list/document-list.component';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
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

@Component({
  selector: 'app-documents-search',
  templateUrl: '../documents/documents.component.html',
  styleUrls: ['../documents/documents.component.css']
})
export class DocumentsSearchComponent extends DocumentsComponent implements AfterViewInit, OnInit, OnDestroy {

  private searchSubscription: Subscription;
  private activeRouteSubscription: Subscription;

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
  }

  ngAfterViewInit(): void {
    Tools.sleep(0).then(() => {
      this.breadcrumbs.isDisabledInputAnimation = true;
      this.breadcrumbs.isAddSearchResultItem = true;

      this.documentList.isInitOnLoad = false;
      this.searchSubscription = this.searchService.searchResults$.subscribe(found => {
        try {
          this.documentList.addNodes(found, false);
          this.documentList.isLoading = false;
        } catch (e) {
          const ee = e;
        }
      }, e => {
        this.documentList.isLoading = false;
        throw e;
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

    super.ngOnDestroy();
  }

  getEmptyImage(): string {
    return '/assets/images/empty-search.svg';
  }

  getEmptyCaption(): string {
    return this.translate.instant('searchResultsIsEmpty');
  }

  protected onCurrentObjectLoaded(node: IObjectNode): void {
    this.activeRouteSubscription = this.activatedRoute.queryParams.subscribe((params: ParamMap) => {
      const q = this.activatedRoute.snapshot.queryParams['q'];
      if (q) {
        this.documentList.isLoading = true;
        this.documentList.nodes = null;
        this.breadcrumbs.searchInputText = q;
        const contextObjectId = node.id;
        this.searchService.searchObjects(q, true, contextObjectId, this.ngUnsubscribe);
      }
    });
  }
}
