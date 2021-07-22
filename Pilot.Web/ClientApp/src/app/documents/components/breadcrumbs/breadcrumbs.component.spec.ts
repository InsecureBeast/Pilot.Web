import { ComponentFixture, ComponentFixtureAutoDetect, TestBed } from "@angular/core/testing";
import { BrowserModule, By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { browser } from "protractor";
import { Subject } from "rxjs";
import { RequestType } from "src/app/core/headers.provider";
import { NodeStyle, NodeStyleService } from "src/app/core/node-style.service";
import { RepositoryService } from "src/app/core/repository.service";
import { SearchApi } from "src/app/core/search/search.api";
import { SearchService } from "src/app/core/search/search.service";
import { randomIObject } from "src/tests/utils";
import { instance, mock, reset, verify, when } from "ts-mockito";
import { DocumentsNavigationService } from "../../shared/documents-navigation.service";
import { DocumentsService } from "../../shared/documents.service";
import { BreadcrumbNode } from "./breadcrumb.node";
import { BreadcrumbsComponent } from "./breadcrumbs.component";

describe('breadcrumbs component', () => {
    let component: BreadcrumbsComponent;
    let fixture: ComponentFixture<BreadcrumbsComponent>;

    let repositoryMock: RepositoryService;
    let repository: RepositoryService;
    let nodeStyleServiceMock: NodeStyleService;
    let nodeStyleService: NodeStyleService;
    let documentsServiceMock: DocumentsService;
    let documentsService: DocumentsService;
    let documentsNavigationServiceMock: DocumentsNavigationService;
    let documentsNavigationService: DocumentsNavigationService;
    let searchService: SearchService;
    let searchApiMock: SearchApi;
    let searchApi: SearchApi;

    beforeEach((() => {
        repositoryMock = mock(RepositoryService);
        repository = instance(repositoryMock);
        nodeStyleServiceMock = mock(NodeStyleService);
        nodeStyleService = instance(nodeStyleServiceMock);
        documentsServiceMock = mock(DocumentsService);
        documentsService = instance(documentsServiceMock);
        documentsNavigationServiceMock = mock(DocumentsNavigationService);
        documentsNavigationService = instance(documentsNavigationServiceMock);
        searchApiMock = mock(SearchApi);
        searchApi = instance(searchApiMock);
        searchService = new SearchService(searchApiMock);

        when(nodeStyleServiceMock.getNodeStyle()).thenReturn(new Subject<NodeStyle>());

        TestBed.configureTestingModule({
            declarations: [ BreadcrumbsComponent ],
            imports: [
                BrowserModule, 
                NoopAnimationsModule,
                TranslateModule.forRoot() 
            ],
            providers: [
                { provide: ComponentFixtureAutoDetect, useValue: true },
                { provide: RepositoryService, useValue: repository },
                { provide: NodeStyleService, useValue: nodeStyleService },
                { provide: DocumentsService, useValue: documentsService },
                { provide: DocumentsNavigationService, useValue: documentsNavigationService },
                { provide: SearchService, useValue: searchService }
            ]
        });
        fixture = TestBed.createComponent(BreadcrumbsComponent);
        component = fixture.componentInstance;
    }));

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should select element', () => {
        // given
        const iObj = randomIObject('some-guid-id');
        const node = new BreadcrumbNode(iObj, false);
        spyOn(component.onSelected, 'emit');

        // when
        component.onSelect(node);

        // then
        verify(repositoryMock.setRequestType(RequestType.New)).once();
        verify(documentsServiceMock.changeClearChecked(true)).once();
        fixture.detectChanges();
        expect(component.onSelected.emit).toHaveBeenCalledWith(node);
    });

    it('should change style', () => {
        // when
        component.changeStyle(0);

        // then
        verify(nodeStyleServiceMock.setNodeStyle(NodeStyle.ListView)).once();
        verify(nodeStyleServiceMock.setNodeStyle(NodeStyle.GridView)).never();

        // when
        reset(nodeStyleServiceMock);
        component.changeStyle(1);

        // then
        verify(nodeStyleServiceMock.setNodeStyle(NodeStyle.ListView)).never();
        verify(nodeStyleServiceMock.setNodeStyle(NodeStyle.GridView)).once();
    });

    it('should change search mode', async () => {
        // when
        component.toggleSearchInput(true);
        fixture.detectChanges();

        // then
        expect(searchService.isSearchInputShown).toEqual(true);
        // verify html element is shown
        const nativeElement = fixture.nativeElement;
        const searchInput = nativeElement.querySelector('input');
        expect(searchInput).toBeDefined();

        // when
        const closeBtn = fixture.debugElement.query(By.css('#close-search-button'));
        closeBtn.nativeElement.click();

        fixture.detectChanges();
        await fixture.whenStable();

        // then
        expect(searchService.isSearchInputShown).toEqual(false);
        const searchInput1 = fixture.debugElement.query(By.css('#search-input'));
        expect(searchInput1).toBeNull();
    });
});