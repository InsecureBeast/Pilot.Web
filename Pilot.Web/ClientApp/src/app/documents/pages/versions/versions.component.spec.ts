import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionsComponent } from './versions.component';
import { RepositoryService } from 'src/app/core/repository.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { mock, instance, when } from 'ts-mockito';
import { IObject } from 'src/app/core/data/data.classes';
import { BehaviorSubject, of } from 'rxjs';
import { DocumentsNavigationService } from '../../shared/documents-navigation.service';

describe('VersionsComponent', () => {
  let repositoryMock: RepositoryService;
  let repository: RepositoryService;
  let activatedRouteMock: ActivatedRoute;
  let activatedRoute: ActivatedRoute;
  let navigationServiceMock: DocumentsNavigationService;
  let navigationService: DocumentsNavigationService;
  let paramMapMock: ParamMap;

  let component: VersionsComponent;
  let fixture: ComponentFixture<VersionsComponent>;

  beforeEach(async () => {
    navigationServiceMock = mock(DocumentsNavigationService);
    navigationService = instance(navigationServiceMock);
    repositoryMock = mock(RepositoryService);
    repository = instance(repositoryMock);
    activatedRouteMock = mock(ActivatedRoute);
    activatedRoute = instance(activatedRouteMock);

    paramMapMock = mock<ParamMap>();
    const paramMap = instance(paramMapMock);
    const objectId = '151512b6-6d83-4512-8e81-adfd79394e3d';
    when(paramMapMock.get('id')).thenReturn(objectId);
    when(activatedRouteMock.paramMap).thenReturn(new BehaviorSubject<ParamMap>(paramMap));

    const documentMock = mock<IObject>();
    const document = instance(documentMock);
    when(documentMock.id).thenReturn(objectId);

    when(repositoryMock.getObjectAsync(objectId)).thenResolve(document);

    await TestBed.configureTestingModule({
      declarations: [ VersionsComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute, params: of({id: '151512b6-6d83-4512-8e81-adfd79394e3d'}) },
        { provide: RepositoryService, useValue: repository },
        { provide: DocumentsNavigationService, useValue: navigationService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
