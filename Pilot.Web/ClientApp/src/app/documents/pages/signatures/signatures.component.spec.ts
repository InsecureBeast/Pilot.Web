import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignaturesComponent } from './signatures.component';
import { RepositoryService } from 'src/app/core/repository.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { mock, instance, when } from 'ts-mockito';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { IFileSnapshot, IObject, IType } from 'src/app/core/data/data.classes';

describe('SignaturesComponent', () => {
  let repositoryMock: RepositoryService;
  let repository: RepositoryService;
  let activatedRouteMock: ActivatedRoute;
  let activatedRoute: ActivatedRoute;
  let routerMock: Router;
  let router: Router;
  let paramMapMock: ParamMap;

  let component: SignaturesComponent;
  let fixture: ComponentFixture<SignaturesComponent>;

  beforeEach(async () => {
    routerMock = mock(Router);
    router = instance(routerMock);
    repositoryMock = mock(RepositoryService);
    repository = instance(repositoryMock);
    activatedRouteMock = mock(ActivatedRoute);
    activatedRoute = instance(activatedRouteMock);

    paramMapMock = mock<ParamMap>();
    const paramMap = instance(paramMapMock);
    const objectId = '151512b6-6d83-4512-8e81-adfd79394e3d';
    when(paramMapMock.get('id')).thenReturn(objectId);
    when(activatedRouteMock.paramMap).thenReturn(new BehaviorSubject<ParamMap>(paramMap));
    // when(routerMock.events).thenReturn(new Subject<Event>());

    const documentMock = mock<IObject>();
    const document = instance(documentMock);
    when(documentMock.id).thenReturn(objectId);

    when(repositoryMock.getObjectAsync(objectId)).thenResolve(document);

    await TestBed.configureTestingModule({
      declarations: [ SignaturesComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute, params: of({id: '151512b6-6d83-4512-8e81-adfd79394e3d'}) },
        { provide: RepositoryService, useValue: repository },
        { provide: Router, useValue: router }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
