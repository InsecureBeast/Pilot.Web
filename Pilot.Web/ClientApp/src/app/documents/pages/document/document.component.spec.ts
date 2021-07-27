import { TestBed, ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap, Event } from '@angular/router';
import { RepositoryService } from 'src/app/core/repository.service';
import { anyOfClass, instance, mock, verify, when } from 'ts-mockito';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { DocumentsService } from '../../shared/documents.service';
import { IFileSnapshot, IObject, IType } from 'src/app/core/data/data.classes';
import { DocumentComponent } from './document.component';
import { SourceFileService } from 'src/app/core/source-file.service';
import { DownloadService } from 'src/app/core/download.service';
import { VersionsSelectorService } from '../../components/document-versions/versions-selector.service';
import { TypeIconService } from 'src/app/core/type-icon.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RequestType } from 'src/app/core/headers.provider';
import { BsModalService, ModalOptions, BsModalRef } from 'ngx-bootstrap/modal';
import { TemplateRef } from '@angular/core';
import { DocumentsNavigationService } from '../../shared/documents-navigation.service';
import { DocumentToolbarComponent } from '../../components/document-toolbar/document-toolbar.component';
import { ContextMenuComponent } from '../../components/context-menu/context-menu.component';
import { BottomSheetComponent } from 'src/app/components/bottom-sheet/bottom-sheet/bottom-sheet.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('document component', () => {
    let component: DocumentComponent;
    let fixture: ComponentFixture<DocumentComponent>;
    let documentsServiceMock: DocumentsService;
    let documentsService: DocumentsService;
    let modalServiceMock: BsModalService;
    let modalService: BsModalService;
    let repositoryMock: RepositoryService;
    let repository: RepositoryService;
    let routerMock: Router;
    let router: Router;
    let activatedRouteMock: ActivatedRoute;
    let activatedRoute: ActivatedRoute;
    let sourceFileServiceMock: SourceFileService;
    let sourceFileService: SourceFileService;
    let downloadServiceMock: DownloadService;
    let downloadService: DownloadService;
    let locationMock: DocumentsNavigationService;
    let location: DocumentsNavigationService;
    let versionSelectorMock: VersionsSelectorService;
    let versionSelector: VersionsSelectorService;
    let typeIconServiceMock: TypeIconService;
    let typeIconService: TypeIconService;
    let translate: TranslateService;
    let paramMapMock: ParamMap;
    let _document: IObject;

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
            parentId: '0718462B-980A-46BA-B1DA-CBFF98A6944C'
        };
        return object;
    };

    const getIObjectStubWithType = function(id: string, type: IType): IObject {
        const object = <IObject> {
            id: id,
            type: type,
            children: [],
            created: '',
        };
        return object;
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
          declarations: [
            DocumentComponent,
            BottomSheetComponent,
            ContextMenuComponent,
            DocumentToolbarComponent
          ]
        })
        .compileComponents();
      });

    beforeEach(async () => {
        repositoryMock = mock(RepositoryService);
        repository = instance(repositoryMock);
        routerMock = mock(Router);
        router = instance(routerMock);
        activatedRouteMock = mock(ActivatedRoute);
        activatedRoute = instance(activatedRouteMock);
        documentsServiceMock = mock(DocumentsService);
        documentsService = instance(documentsServiceMock);
        modalServiceMock = mock(BsModalService);
        modalService = instance(modalServiceMock);
        sourceFileServiceMock = mock(SourceFileService);
        sourceFileService = instance(sourceFileServiceMock);
        downloadServiceMock = mock(DownloadService);
        downloadService = instance(downloadServiceMock);
        locationMock = mock(DocumentsNavigationService);
        location = instance(locationMock);
        versionSelectorMock = mock(VersionsSelectorService);
        versionSelector = instance(versionSelectorMock);
        typeIconServiceMock = mock(TypeIconService);
        typeIconService = mock(typeIconServiceMock);

        // setup mocks
        paramMapMock = mock<ParamMap>();
        const paramMap = instance(paramMapMock);
        const objectId = '151512b6-6d83-4512-8e81-adfd79394e3d';
        when(paramMapMock.get('id')).thenReturn(objectId);
        when(activatedRouteMock.paramMap).thenReturn(new BehaviorSubject<ParamMap>(paramMap));
        when(routerMock.events).thenReturn(new Subject<Event>());

        const fileSnapshotMock = mock<IFileSnapshot>();
        const fileSnapshot = instance(fileSnapshotMock);
        when(versionSelectorMock.selectedSnapshot$).thenReturn(of(fileSnapshot));

        when(documentsServiceMock.objectForCard$).thenReturn(of(''));

        _document = getIObjectStub(objectId);
        when(repositoryMock.getObjectAsync(objectId)).thenResolve(_document);

        TestBed.configureTestingModule({
            declarations: [ DocumentComponent ],
            imports: [ BrowserModule, NoopAnimationsModule, TranslateModule.forRoot(), FormsModule ],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRoute, params: of({id: '151512b6-6d83-4512-8e81-adfd79394e3d'}) },
                { provide: SourceFileService, useValue: sourceFileService },
                { provide: DownloadService, useValue: downloadService },
                { provide: Location, useValue: location },
                { provide: RepositoryService, useValue: repository },
                { provide: Router, useValue: router },
                { provide: VersionsSelectorService, useValue: versionSelector },
                { provide: DocumentsService, useValue: documentsService },
                { provide: BsModalService, useValue: modalService },
                { provide: TypeIconService, useValue: typeIconService }
            ]
        });

        fixture = TestBed.createComponent(DocumentComponent);
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

    it('should go back on close', fakeAsync(() => {
        // given
        fixture.detectChanges();
        flush();

        // when
        component.close(null);

        // then
        // verify(locationMock.navigateToDocumentsFolder('0718462B-980A-46BA-B1DA-CBFF98A6944C')).once();
        verify(repositoryMock.setRequestType(RequestType.FromCache)).once();
        expect().nothing();
    }));

    it('should call download service when download button clicked', fakeAsync(() => {
        // given
        const objectId = '151512b6-6d83-4512-8e81-adfd79394e3d';
        const object = getIObjectStub(objectId);
        when(repositoryMock.getObjectAsync(objectId)).thenResolve(object);

        fixture.detectChanges();
        flush();

        // when
        component.download(null);

        // then
        verify(downloadServiceMock.downloadFile(object)).once();
        expect().nothing();
    }));

    it('should show bottom context menu', (fakeAsync(() => {
        // given
        fixture.detectChanges();
        flush();

        // when
        component.onShowMore(null);

        // then
        const contextMenuDebugElement = fixture.debugElement.query(By.directive(ContextMenuComponent));
        expect(contextMenuDebugElement).not.toBeNull();
        expect(contextMenuDebugElement).not.toBeUndefined();
    })));

    it('should fill context menu for document', (fakeAsync(() => {
        // given
        fixture.detectChanges();
        flush();

        // when
        component.onShowMore(null);

        // then
        const contextMenuDebugElement = fixture.debugElement.query(By.directive(ContextMenuComponent));
        const contextMenuComponent = contextMenuDebugElement.componentInstance;
        expect(contextMenuComponent.items.length).toBe(5);
        expect(contextMenuComponent.items[0].title).toBe('download');
        expect(contextMenuComponent.items[1].title).toBe('remarks');
        expect(contextMenuComponent.items[2].title).toBe('signatures');
        expect(contextMenuComponent.items[3].title).toBe('versions');
        expect(contextMenuComponent.items[4].title).toBe('card');
    })));

    it('should fill context menu for ECM document', (fakeAsync(() => {
        // given
        const objectId = '151512b6-6d83-4512-8e81-adfd79394e3d';
        const ecmType = <IType> {
            id: 2,
            children: [],
            attributes: [],
            isMountable: true
        };

        const object = getIObjectStubWithType(objectId, ecmType);
        when(repositoryMock.getObjectAsync(objectId)).thenResolve(object);

        fixture.detectChanges();
        flush();

        // when
        component.onShowMore(null);

        // then
        const contextMenuDebugElement = fixture.debugElement.query(By.directive(ContextMenuComponent));
        const contextMenuComponent = contextMenuDebugElement.componentInstance;
        expect(contextMenuComponent.items.length).toBe(6);
        expect(contextMenuComponent.items[0].title).toBe('download');
        expect(contextMenuComponent.items[1].title).toBe('sourceFiles');
        expect(contextMenuComponent.items[2].title).toBe('remarks');
        expect(contextMenuComponent.items[3].title).toBe('signatures');
        expect(contextMenuComponent.items[4].title).toBe('versions');
        expect(contextMenuComponent.items[5].title).toBe('card');
    })));

    it('should show document card', fakeAsync(() => {
        // given
        fixture.detectChanges();
        flush();

        // when
        const cardTemplateMock = mock(TemplateRef);
        const cardTemplate = instance(cardTemplateMock);
        component.onShowDocumentCard(cardTemplate);

        // then
        verify(modalServiceMock.show(cardTemplate, anyOfClass(ModalOptions))).once();
        expect().nothing();
    }));

    it('should show document card when click context menu', fakeAsync(() => {
        // given
        spyOn(component, 'onShowDocumentCard');
        fixture.detectChanges();
        flush();

        component.onShowMore(null);
        fixture.detectChanges();

        // when
        const contextMenuDebugElement = fixture.debugElement.query(By.directive(ContextMenuComponent));
        const link = contextMenuDebugElement.query(By.css('#cardId'));
        link.triggerEventHandler('click', null);

        // then
        expect(component.onShowDocumentCard).toHaveBeenCalled();
        expect().nothing();
    }));

    it('should download document card when click context menu', fakeAsync(() => {
        // given
        spyOn(component, 'download');
        fixture.detectChanges();
        flush();

        component.onShowMore(null);
        fixture.detectChanges();

        // when
        const contextMenuDebugElement = fixture.debugElement.query(By.directive(ContextMenuComponent));
        const link = contextMenuDebugElement.query(By.css('#downloadId'));
        link.triggerEventHandler('click', null);

        // then
        expect(component.download).toHaveBeenCalled();
        expect().nothing();
    }));

    it('should open source files when click context menu', fakeAsync(() => {
        // given
        // given
        const objectId = '151512b6-6d83-4512-8e81-adfd79394e3d';
        const ecmType = <IType> {
            id: 2,
            children: [],
            attributes: [],
            isMountable: true
        };

        const object = getIObjectStubWithType(objectId, ecmType);
        when(repositoryMock.getObjectAsync(objectId)).thenResolve(object);

        spyOn(component, 'showFiles');
        fixture.detectChanges();
        flush();

        component.onShowMore(null);
        fixture.detectChanges();

        // when
        const contextMenuDebugElement = fixture.debugElement.query(By.directive(ContextMenuComponent));
        const link = contextMenuDebugElement.query(By.css('#sourceFilesId'));
        link.triggerEventHandler('click', null);

        // then
        expect(component.showFiles).toHaveBeenCalled();
        expect().nothing();
    }));

    it('should close document card', fakeAsync(() => {
        // given
        fixture.detectChanges();
        flush();

        const cardTemplateMock = mock(TemplateRef);
        const cardTemplate = instance(cardTemplateMock);
        const modalRefMock =  mock(BsModalRef);
        const modalRef =  instance(modalRefMock);
        when(modalRefMock.id).thenReturn(1);
        when(modalServiceMock.show(cardTemplate, anyOfClass(ModalOptions))).thenReturn(modalRef);
        component.onShowDocumentCard(cardTemplate);

        // when
        component.onCloseDocumentCard(null);

        // then
         verify(modalServiceMock.hide(1)).once();
        expect().nothing();
    }));

    it('should close document card on change', fakeAsync(() => {
        // given
        const id = '151512b6-6d83-4512-8e81-adfd79394e3d';
        fixture.detectChanges();
        flush();

        const cardTemplateMock = mock(TemplateRef);
        const cardTemplate = instance(cardTemplateMock);
        const modalRefMock =  mock(BsModalRef);
        const modalRef =  instance(modalRefMock);
        when(modalRefMock.id).thenReturn(1);
        when(modalServiceMock.show(cardTemplate, anyOfClass(ModalOptions))).thenReturn(modalRef);
        component.onShowDocumentCard(cardTemplate);

        // when
        component.onChangeDocumentCard(id);

        // then
        verify(documentsServiceMock.changeObjectForCard(id)).once();
        verify(modalServiceMock.hide(1)).once();
        expect().nothing();
    }));
});
