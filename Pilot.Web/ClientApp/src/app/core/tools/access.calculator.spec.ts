import { TestBed } from '@angular/core/testing';
import { instance, mock, when } from 'ts-mockito';
import { AccessLevel, IObject, IPerson, ObjectState, StateInfo } from '../data/data.classes';
import { RepositoryService } from '../repository.service';
import { AccessCalculator, ObjectSecurityService } from './access.calculator';

describe('FilesRepositoryService', () => {
  let service: AccessCalculator;
  let repositoryMock:RepositoryService;
  let repository: RepositoryService;
  let securityServiceMock: ObjectSecurityService;
  let securityService: ObjectSecurityService;

  beforeEach(() => {
    repositoryMock = mock(RepositoryService);
    repository = instance(repositoryMock);

    securityServiceMock = mock(ObjectSecurityService);
    securityService = instance(securityServiceMock);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
          { provide: RepositoryService, useValue: repository },
          { provide: ObjectSecurityService, useValue: securityService },
        ]
    });
    service = TestBed.inject(AccessCalculator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate access for person', () => {
    // given
    const objectMock = mock<IObject>();
    const object = instance(objectMock);
    const personMock = mock<IPerson>();
    const person = instance(personMock);

    when(securityServiceMock.getAccessByPerson(object, person)).thenReturn(AccessLevel.Full);

    // when
    const actual = service.calcAccessForPerson(object, person);

    // then
    expect(actual).toEqual(AccessLevel.Full);
  });

  it('should calculate access for null person', () => {
    // given
    const objectMock = mock<IObject>();
    const object = instance(objectMock);

    // when
    let actual = service.calcAccessForPerson(object, null);
    // then
    expect(actual).toEqual(AccessLevel.None);

    // when
    actual = service.calcAccessForPerson(object, undefined);
    // then
    expect(actual).toEqual(AccessLevel.None);
  });

  it('should remove edit access if object in recycle bin', () => {
    // given
    const objectMock = mock<IObject>();
    const stateInfo = new StateInfo();
    stateInfo.state = ObjectState.InRecycleBin;
    when(objectMock.stateInfo).thenReturn(stateInfo);
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    const person = instance(personMock);

    when(securityServiceMock.getAccessByPerson(object, person)).thenReturn(AccessLevel.Full);

    // when
    const actual = service.calcAccessForPerson(object, person);

    // then
    expect(actual).toEqual(AccessLevel.ViewCreate | AccessLevel.Agreement | AccessLevel.Freeze);
  });

  it('should get view and freeze access level if object frozen', () => {
    // given
    const objectMock = mock<IObject>();
    const stateInfo = new StateInfo();
    stateInfo.state = ObjectState.Frozen;
    when(objectMock.stateInfo).thenReturn(stateInfo);
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    const person = instance(personMock);

    when(securityServiceMock.getAccessByPerson(object, person)).thenReturn(AccessLevel.Full);

    // when
    const actual = service.calcAccessForPerson(object, person);

    // then
    expect(actual).toEqual(AccessLevel.View | AccessLevel.Freeze);
  });

  it('should get view access level if object frozen', () => {
    // given
    const objectMock = mock<IObject>();
    const stateInfo = new StateInfo();
    stateInfo.state = ObjectState.Frozen;
    when(objectMock.stateInfo).thenReturn(stateInfo);
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    const person = instance(personMock);

    when(securityServiceMock.getAccessByPerson(object, person)).thenReturn(AccessLevel.ViewEdit);

    // when
    const actual = service.calcAccessForPerson(object, person);

    // then
    expect(actual).toEqual(AccessLevel.View);
  });

  it('should calculate acces for object', () => {
    // given
    const objectMock = mock<IObject>();
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    const person = instance(personMock);

    when(repositoryMock.getCurrentPerson()).thenReturn(person);
    when(securityServiceMock.getAccessByPerson(object, person)).thenReturn(AccessLevel.ViewEdit);

    // when
    const actual = service.calcAccess(object);

    // then
    expect(actual).toEqual(AccessLevel.ViewEdit);
  });
});