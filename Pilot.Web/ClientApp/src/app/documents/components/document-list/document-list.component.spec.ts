import { TestBed, ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Router, Event } from '@angular/router';
import { RepositoryService } from 'src/app/core/repository.service';
import { instance, mock, when, anything } from 'ts-mockito';
import { of, Subject } from 'rxjs';
import { DocumentListComponent } from './document-list.component';
import { TypeIconService } from 'src/app/core/type-icon.service';
import { DocumentsService } from '../../shared/documents.service';
import { IObjectNode } from '../../shared/node.interface';
import { DownloadService } from 'src/app/core/download.service';
import { NodeStyle, NodeStyleService } from 'src/app/core/node-style.service';
import { ChildrenType } from 'src/app/core/data/children.types';
import { createIChildStub, randomIObject } from 'src/tests/utils';
import { skipWhile } from 'rxjs/operators';
import { FilesRepositoryService } from 'src/app/core/files-repository.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AccessCalculator } from 'src/app/core/tools/access.calculator';
import { RequestType } from 'src/app/core/headers.provider';

describe('documents component', () => {
    let component: DocumentListComponent;
    let fixture: ComponentFixture<DocumentListComponent>;

    let translate: TranslateService;
    let typeIconServiceMock: TypeIconService;
    let typeIconService: TypeIconService;
    let documentsServiceMock: DocumentsService;
    let documentsService: DocumentsService;
    let repositoryMock: RepositoryService;
    let repository: RepositoryService;
    let routerMock: Router;
    let router: Router;
    let downloadServiceMock: DownloadService;
    let downloadService: DownloadService;
    let nodeStyleServiceMock: NodeStyleService;
    let nodeStyleService: NodeStyleService;
    let filesRepositoryServiceMock: FilesRepositoryService;
    let filesRepositoryService: FilesRepositoryService;
    let bsModalServiceMock: BsModalService;
    let bsModalService: BsModalService;
    let accessCalculatorMock: AccessCalculator;
    let accessCalculatorService: AccessCalculator;

    const createNodeMock = function(): IObjectNode {
        const parentId = '2B7AA16E-760A-41E2-A486-8BE402EB6387';
        const nodeMock = mock<IObjectNode>();
        const child1 = createIChildStub('2DC0C3C9-2B8C-44F6-A7A9-0997B4EE6BE4', 2);
        const child2 = createIChildStub('2F7726BA-5694-4B1C-9DE2-0E4C30B12C81', 2);

        when(nodeMock.children).thenReturn([child1, child2]);
        when(nodeMock.isSource).thenReturn(false);
        when(nodeMock.id).thenReturn(parentId);

        const childObject1 = randomIObject('2DC0C3C9-2B8C-44F6-A7A9-0997B4EE6BE4');
        const childObject2 = randomIObject('2F7726BA-5694-4B1C-9DE2-0E4C30B12C81');
        const objects = [childObject1, childObject2];
        when(repositoryMock.getChildrenAsync(parentId, ChildrenType.ListView, anything(), RequestType.None)).thenResolve(objects);
        when(repositoryMock.getChildrenAsync(parentId, ChildrenType.ListView, anything(), RequestType.New)).thenResolve(objects);
        return nodeMock;
    };

    beforeEach(async () => {
        repositoryMock = mock(RepositoryService);
        repository = instance(repositoryMock);
        routerMock = mock(Router);
        router = instance(routerMock);
        typeIconServiceMock = mock(TypeIconService);
        typeIconService = instance(typeIconServiceMock);
        documentsServiceMock = mock(DocumentsService);
        documentsService = instance(documentsServiceMock);
        downloadServiceMock = mock(DownloadService);
        downloadService = instance(downloadServiceMock);
        nodeStyleServiceMock = mock(NodeStyleService);
        nodeStyleService = instance(nodeStyleServiceMock);
        filesRepositoryServiceMock = mock(FilesRepositoryService);
        filesRepositoryService = instance(filesRepositoryServiceMock);
        bsModalServiceMock = mock(BsModalService);
        bsModalService = instance(bsModalServiceMock);
        accessCalculatorMock = mock(AccessCalculator);
        accessCalculatorService = instance(accessCalculatorMock);

        // setup mocks
        when(routerMock.events).thenReturn(new Subject<Event>());
        when(documentsServiceMock.objectForCard$).thenReturn(of(''));
        when(documentsServiceMock.clearChecked).thenReturn(of(false));
        when(nodeStyleServiceMock.getNodeStyle()).thenReturn(of(NodeStyle.ListView));

        TestBed.configureTestingModule({
            declarations: [ DocumentListComponent ],
            imports: [ BrowserModule, TranslateModule.forRoot(), FormsModule ],
            providers: [
                { provide: RepositoryService, useValue: repository },
                { provide: Router, useValue: router },
                { provide: TypeIconService, useValue: typeIconService },
                { provide: DocumentsService, useValue: documentsService },
                { provide: DownloadService, useValue: downloadService },
                { provide: NodeStyleService, useValue: nodeStyleService },
                { provide: FilesRepositoryService, useValue: filesRepositoryService },
                { provide: BsModalService, useValue: bsModalService },
                { provide: AccessCalculator, useValue: accessCalculatorService },
            ]
        });
        translate = TestBed.inject(TranslateService);

        fixture = TestBed.createComponent(DocumentListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should emit loaded event', fakeAsync(() => {
        // given
        const nodeMock = createNodeMock();
        const node = instance(nodeMock);

        let isLoaded = false;
        component.loaded.pipe(skipWhile(a => !a)).subscribe((v) => {
            isLoaded = true;
            expect(v).toBe(node);
        });

        // when
        component.parent = node;
        fixture.detectChanges();
        flush();

        // then
        expect(isLoaded).toBeTrue();
    }));

    // it('should emit selected event', fakeAsync(async () => {
    //     // given
    //     const nodeMock = createNodeMock();
    //     const node = instance(nodeMock);
    //     component.parent = node;
    //     fixture.detectChanges();
    //     //flush();

    //     await fixture.whenStable();

    //     const firstEl = fixture.debugElement.queryAll(By.css('li'));
    //     // when
    //     let checkedNode: IObjectNode;
    //     component.checked.pipe(skipWhile(a => !a)).subscribe((value) =>
    //     {
    //         checkedNode = value[0];
    //     });
    //     //firstEl.triggerEventHandler('click', null);

    //     // then
    //     expect(checkedNode).not.toBeNull();
    //     expect(checkedNode).not.toBeUndefined();
    //     //expect(checkedNode.id).toBe(node.children[0].objectId);
    // }));
});
