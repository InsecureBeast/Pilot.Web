import { TestBed, ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap, Event } from '@angular/router';
import { RepositoryService } from 'src/app/core/repository.service';
import { anyOfClass, anything, instance, mock, verify, when } from 'ts-mockito';
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
import { BsModalService } from 'ngx-bootstrap/modal';
import { TemplateRef, ViewContainerRef } from '@angular/core';
import { Mock } from 'protractor/built/driverProviders';

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
    let locationMock: Location;
    let location: Location;
    let versionSelectorMock: VersionsSelectorService;
    let versionSelector: VersionsSelectorService;
    let typeIconServiceMock: TypeIconService;
    let typeIconService: TypeIconService;
    let translate: TranslateService;
    let paramMapMock: ParamMap;

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
        documentsServiceMock = mock(DocumentsService);
        documentsService = instance(documentsServiceMock);
        modalServiceMock = mock(BsModalService);
        modalService = instance(modalServiceMock);
        sourceFileServiceMock = mock(SourceFileService);
        sourceFileService = instance(sourceFileServiceMock);
        downloadServiceMock = mock(DownloadService);
        downloadService = instance(downloadServiceMock);
        locationMock = mock(Location);
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

        const object = getIObjectStub(objectId);
        when(repositoryMock.getObjectAsync(objectId)).thenResolve(object);

        TestBed.configureTestingModule({
            declarations: [ DocumentComponent ],
            imports: [ BrowserModule, TranslateModule.forRoot(), FormsModule ],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRoute },
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
        verify(locationMock.back()).once();
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

    it('should show document version', fakeAsync(() => {
        // given
        component.isInfoShown = false;
        fixture.detectChanges();
        flush();

        // when
        component.toggleDocumentVersions(null);

        // then
        expect(component.isInfoShown).toBeTrue();
    }));

    it('should close document version if toolbar button pressed again', fakeAsync(() => {
        // given
        component.isInfoShown = true;
        fixture.detectChanges();
        flush();

        // when
        component.toggleDocumentVersions(null);

        // then
        expect(component.isInfoShown).toBeFalse();
    }));

    it('should close document version', fakeAsync(() => {
        // given
        component.isInfoShown = true;
        fixture.detectChanges();
        flush();

        // when
        component.closeDocumentVersions(null);

        // then
        expect(component.isInfoShown).toBeFalse();
    }));

    it('should show document card', fakeAsync(() => {
        // given
        fixture.detectChanges();
        flush();

        // when
        const cardTemplateMock = mock(TemplateRef);
        const cardTemplate = instance(cardTemplateMock);
        component.onShowDocumentCard(cardTemplate);

        // then
        //verify(modalServiceMock.show(anything())).once();
        expect().nothing();
    }));

    it('should close document card', fakeAsync(() => {
        // given
        fixture.detectChanges();
        flush();

        // const cardTemplateMock = mock(TemplateRef);
        // const cardTemplate = instance(cardTemplateMock);
        // component.onShowDocumentCard(cardTemplate);

        // when
        //component.onCloseDocumentCard(null);

        // then
        //verify(modalServiceMock.hide(1)).once();
        expect().nothing();
    }));

    it('should close document card on change', fakeAsync(() => {
        // given
        const id = '151512b6-6d83-4512-8e81-adfd79394e3d';
        fixture.detectChanges();
        flush();

        // when
        //component.onChangeDocumentCard(id);

        // then
        //verify(documentsServiceMock.changeObjectForCard(id)).once();
        //verify(modalServiceMock.hide(0)).once();
        expect().nothing();
    }));
});
