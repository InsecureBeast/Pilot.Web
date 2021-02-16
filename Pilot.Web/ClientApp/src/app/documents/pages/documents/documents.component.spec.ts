import { TestBed, ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap, Event, ActivatedRouteSnapshot, UrlHandlingStrategy, UrlSegment } from '@angular/router';
import { RepositoryService } from 'src/app/core/repository.service';
import { anyString, instance, mock, verify, when } from 'ts-mockito';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { DocumentsComponent } from './documents.component';
import { TypeIconService } from 'src/app/core/type-icon.service';
import { DocumentsNavigationService } from '../../shared/documents-navigation.service';
import { DocumentsService } from '../../shared/documents.service';
import { ScrollPositionService } from 'src/app/core/scroll-position.service';
import { ModalService } from 'src/app/ui/modal/modal.service';
import { INode } from '../../shared/node.interface';
import { IObject, IType } from 'src/app/core/data/data.classes';
import { HttpErrorResponse } from '@angular/common/http';
import { BsModalService } from 'ngx-bootstrap/modal';

describe('documents component', () => {
    let component: DocumentsComponent;
    let fixture: ComponentFixture<DocumentsComponent>;
    let typeIconServiceMock: TypeIconService;
    let typeIconService: TypeIconService;
    let translate: TranslateService;
    let navigationServiceMock: DocumentsNavigationService;
    let navigationService: DocumentsNavigationService;
    let documentsServiceMock: DocumentsService;
    let documentsService: DocumentsService;
    let scrollPositionServiceMock: ScrollPositionService;
    let scrollPositionService: ScrollPositionService;
    let modalServiceMock: ModalService;
    let modalService: ModalService;
    let bsModalServiceMock: BsModalService;
    let bsModalService: BsModalService;
    let repositoryMock: RepositoryService;
    let repository: RepositoryService;
    let routerMock: Router;
    let router: Router;
    let activatedRouteMock: ActivatedRoute;
    let activatedRoute: ActivatedRoute;
    let paramMapMock: ParamMap;

    const currentObjectId = '151512b6-6d83-4512-8e81-adfd79394e3d';

    const getIObjectStub = function(id: string): IObject {
        const type = <IType> {
            id: 2,
            children: [],
            attributes: []
        };
        const object = <IObject> {
            id: id,
            type: type,
            children: [],
            created: '',
        };
        return object;
    };

    beforeEach(async () => {
        repositoryMock = mock(RepositoryService);
        repository = instance(repositoryMock);
        routerMock = mock(Router);
        router = instance(routerMock);
        activatedRouteMock = mock(ActivatedRoute);
        activatedRoute = instance(activatedRouteMock);
        typeIconServiceMock = mock(TypeIconService);
        typeIconService = instance(typeIconServiceMock);
        navigationServiceMock = mock(DocumentsNavigationService);
        navigationService = instance(navigationServiceMock);
        documentsServiceMock = mock(DocumentsService);
        documentsService = instance(documentsServiceMock);
        scrollPositionServiceMock = mock(ScrollPositionService);
        scrollPositionService = instance(scrollPositionServiceMock);
        modalServiceMock = mock(ModalService);
        modalService = instance(modalServiceMock);
        bsModalServiceMock = mock(BsModalService);
        bsModalService = instance(bsModalServiceMock);

        // setup mocks
        paramMapMock = mock<ParamMap>();
        const paramMap = instance(paramMapMock);
        const snapshot = new ActivatedRouteSnapshot();
        snapshot.url = new Array<UrlSegment>();
        when(paramMapMock.get('id')).thenReturn(currentObjectId);
        when(activatedRouteMock.paramMap).thenReturn(new BehaviorSubject<ParamMap>(paramMap));
        when(activatedRouteMock.snapshot).thenReturn(snapshot);
        when(routerMock.events).thenReturn(new Subject<Event>());
        when(documentsServiceMock.objectForCard$).thenReturn(of(''));
        const object = getIObjectStub(currentObjectId);
        when(repositoryMock.getObjectAsync(currentObjectId)).thenResolve(object);

        TestBed.configureTestingModule({
            declarations: [ DocumentsComponent ],
            imports: [ BrowserModule, TranslateModule.forRoot(), FormsModule ],
            providers: [
                { provide: RepositoryService, useValue: repository },
                { provide: Router, useValue: router },
                { provide: ActivatedRoute, useValue: activatedRoute },
                { provide: TypeIconService, useValue: typeIconService },
                { provide: DocumentsNavigationService, useValue: navigationService },
                { provide: DocumentsService, useValue: documentsService },
                { provide: ScrollPositionService, useValue: scrollPositionService },
                { provide: ModalService, useValue: modalService },
                { provide: BsModalService, useValue: bsModalService }
            ]
        });

        fixture = TestBed.createComponent(DocumentsComponent);
        translate = TestBed.inject(TranslateService);
        component = fixture.componentInstance;
    });

    it('should create', fakeAsync(() => {
        // when
        fixture.detectChanges();
        flush();

        // then
        expect(component).toBeTruthy();
    }));

    it('should restore scroll position on list loaded', fakeAsync(() => {
        // given
        // const objectId = '5E85B744-193C-4469-AAFE-1B90F9301451';
        // when(paramMapMock.get('id')).thenReturn(objectId);

        // const object = getIObjectStub(objectId);
        // when(repositoryMock.getObjectAsync(objectId)).thenResolve(object);

        fixture.detectChanges();
        flush();

        // when
        const node = mock<INode>();
        component.onListLoaded(node);

        // then
        verify(scrollPositionServiceMock.restoreScrollPosition(anyString())).once();
        expect().nothing();
    }));

    it('should save scroll position on item selected', fakeAsync(() => {
        // given
        fixture.detectChanges();
        flush();

        // when
        const node = mock<INode>();
        component.onItemSelected(node);

        // then
        verify(scrollPositionServiceMock.saveScrollPosition(anyString())).once();
        expect().nothing();
    }));

    it('should navigate to document', fakeAsync(() => {
        // given
        const nodeId = 'CA3DDF8E-5B39-4CAB-8D69-B2A32B00D717';
        const node = <INode> {
            id: nodeId,
            isDocument: true,
            isSource: false
        };

        fixture.detectChanges();
        flush();

        // when
        component.onItemSelected(node);

        // then
        verify(navigationServiceMock.navigateToFile(currentObjectId, nodeId)).never();
        verify(navigationServiceMock.navigateToDocument(currentObjectId, nodeId)).once();
        verify(navigationServiceMock.navigateToDocumentsFolder(nodeId)).never();
        verify(navigationServiceMock.navigateToFilesFolder(nodeId)).never();
        expect().nothing();
    }));

    it('should navigate to file', fakeAsync(() => {
        // given
        const nodeId = 'CA3DDF8E-5B39-4CAB-8D69-B2A32B00D717';
        const node = <INode> {
            id: nodeId,
            isDocument: true,
            isSource: true
        };

        fixture.detectChanges();
        flush();

        // when
        component.onItemSelected(node);

        // then
        verify(navigationServiceMock.navigateToFile(currentObjectId, nodeId)).once();
        verify(navigationServiceMock.navigateToDocument(currentObjectId, nodeId)).never();
        verify(navigationServiceMock.navigateToDocumentsFolder(nodeId)).never();
        verify(navigationServiceMock.navigateToFilesFolder(nodeId)).never();
        expect().nothing();
    }));

    it('should navigate to documents folder', fakeAsync(() => {
        // given
        const nodeId = 'CA3DDF8E-5B39-4CAB-8D69-B2A32B00D717';
        const node = <INode> {
            id: nodeId,
            isDocument: false,
            isSource: false
        };

        fixture.detectChanges();
        flush();

        // when
        component.onItemSelected(node);

        // then
        verify(navigationServiceMock.navigateToFile(currentObjectId, nodeId)).never();
        verify(navigationServiceMock.navigateToDocument(currentObjectId, nodeId)).never();
        verify(navigationServiceMock.navigateToDocumentsFolder(nodeId)).once();
        verify(navigationServiceMock.navigateToFilesFolder(nodeId)).never();
        expect().nothing();
    }));

    it('should navigate to files folder', fakeAsync(() => {
        // given
        const nodeId = 'CA3DDF8E-5B39-4CAB-8D69-B2A32B00D717';
        const node = <INode> {
            id: nodeId,
            isDocument: false,
            isSource: true
        };

        fixture.detectChanges();
        flush();

        // when
        component.onItemSelected(node);

        // then
        verify(navigationServiceMock.navigateToFile(currentObjectId, nodeId)).never();
        verify(navigationServiceMock.navigateToDocument(currentObjectId, nodeId)).never();
        verify(navigationServiceMock.navigateToDocumentsFolder(nodeId)).never();
        verify(navigationServiceMock.navigateToFilesFolder(nodeId)).once();
        expect().nothing();
    }));

    it('should change checked items', fakeAsync(() => {
        // given
        const node1 = <INode> {
            id: 'CA3DDF8E-5B39-4CAB-8D69-B2A32B00D717',
            isDocument: false,
            isSource: true
        };

        const node2 = <INode> {
            id: '8FA40F61-1D5E-428A-B2AD-5DB1CC60950F',
            isDocument: false,
            isSource: true
        };

        fixture.detectChanges();
        flush();

        // when
        component.onItemsChecked([node1, node2]);

        // then
        expect(component.checked.length).toBe(2);
    }));

    it('should set error', fakeAsync(() => {
        // given
        const error =  new HttpErrorResponse({error: 'error message' });

        fixture.detectChanges();
        flush();

        // when
        component.onError(error);

        // then
        expect(component.error).toEqual(error);
    }));

    // it('should show object card', fakeAsync(() => {
    //     // given

    //     fixture.detectChanges();
    //     flush();

    //     // when
    //     component.onShowObjectCard();

    //     // then
    //     verify(modalServiceMock.open('objectCardModal')).once();
    //     expect().nothing();
    // }));

    // it('should close object card', fakeAsync(() => {
    //     // given

    //     fixture.detectChanges();
    //     flush();

    //     // when
    //     component.onCloseObjectCard();

    //     // then
    //     verify(modalServiceMock.close('objectCardModal')).once();
    //     expect().nothing();
    // }));

    // it('should close object card on save', fakeAsync(() => {
    //     // given

    //     fixture.detectChanges();
    //     flush();

    //     // when
    //     component.onSaveObjectCard('8FA40F61-1D5E-428A-B2AD-5DB1CC60950F');

    //     // then
    //     verify(modalServiceMock.close('objectCardModal')).once();
    //     verify(documentsServiceMock.changeObjectForCard('8FA40F61-1D5E-428A-B2AD-5DB1CC60950F')).once();
    //     expect().nothing();
    // }));
});
