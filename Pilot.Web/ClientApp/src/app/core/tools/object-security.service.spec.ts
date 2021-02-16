import { TestBed } from '@angular/core/testing';
import { instance, mock, when } from 'ts-mockito';
import { Access, AccessLevel, AccessRecord, IObject, IPerson, ObjectState, StateInfo } from '../data/data.classes';
import { RepositoryService } from '../repository.service';
import { ObjectSecurityService } from './object-security.service';

describe('FilesRepositoryService', () => {
  let service: ObjectSecurityService;
  let repositoryMock:RepositoryService;
  let repository: RepositoryService;

  beforeEach(() => {
    repositoryMock = mock(RepositoryService);
    repository = instance(repositoryMock);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
          { provide: RepositoryService, useValue: repository },
        ]
    });
    service = TestBed.inject(ObjectSecurityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get access level for person', () => {
    // given
    const objectMock = mock<IObject>();
    const accessRecord = new AccessRecord();
    const access = new Access();
    access.accessLevel = AccessLevel.ViewEdit;
    access.isInheritable = false;
    access.validThrough = new Date(9999, 12);
    accessRecord.access = access;
    accessRecord.orgUnitId = 1;
    when(objectMock.access).thenReturn([accessRecord]);
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    when(personMock.isAdmin).thenReturn(false);
    when(personMock.isDeleted).thenReturn(false);
    when(personMock.allOrgUnits).thenReturn([1]);
    const person = instance(personMock);

    // when
    const actual = service.getAccessByPerson(object, person);

    // then
    expect(actual).toEqual(AccessLevel.ViewEdit);
  });

  it('should get access person or object', () => {
    // given
    const objectMock = mock<IObject>();
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    const person = instance(personMock);

    // when
    let actual = service.getAccessByPerson(undefined, person);
    expect(actual).toEqual(AccessLevel.None);

    // when
    actual = service.getAccessByPerson(null, person);
    expect(actual).toEqual(AccessLevel.None);

    // when
    actual = service.getAccessByPerson(object, undefined);
    expect(actual).toEqual(AccessLevel.None);

    // when
    actual = service.getAccessByPerson(object, null);
    expect(actual).toEqual(AccessLevel.None);

    // when
    actual = service.getAccessByPerson(null, null);
    expect(actual).toEqual(AccessLevel.None);

    // when
    actual = service.getAccessByPerson(undefined, undefined);
    expect(actual).toEqual(AccessLevel.None);
  });

  it('should get full access if object is deleted permanently', () => {
    // given
    const objectMock = mock<IObject>();
    const stateInfo = new StateInfo();
    stateInfo.state = ObjectState.DeletedPermanently;
    when(objectMock.stateInfo).thenReturn(stateInfo);
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    const person = instance(personMock);

    // when
    let actual = service.getAccessByPerson(object, person);

    // then
    expect(actual).toEqual(AccessLevel.Full);
  });

  it('should get full access if user is admin', () => {
    // given
    const objectMock = mock<IObject>();
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    when(personMock.isAdmin).thenReturn(true);
    when(personMock.allOrgUnits).thenReturn([1]);
    const person = instance(personMock);

    // when
    let actual = service.getAccessByPerson(object, person);

    // then
    expect(actual).toEqual(AccessLevel.Full);
  });

  it('should get viewedit access if object in recycle bin', () => {
    // given
    const objectMock = mock<IObject>();
    const stateInfo = new StateInfo();
    stateInfo.state = ObjectState.InRecycleBin;
    stateInfo.positionId = 1;
    when(objectMock.stateInfo).thenReturn(stateInfo);
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    when(personMock.isAdmin).thenReturn(false);
    when(personMock.positions).thenReturn([1]);
    const person = instance(personMock);

    // when
    let actual = service.getAccessByPerson(object, person);

    // then
    expect(actual).toEqual(AccessLevel.ViewEdit);
  });

  it('should get none access if object in recycle bin', () => {
    // given
    const objectMock = mock<IObject>();
    const stateInfo = new StateInfo();
    stateInfo.state = ObjectState.InRecycleBin;
    stateInfo.positionId = 2; // for other person, current person position is 1
    when(objectMock.stateInfo).thenReturn(stateInfo);
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    when(personMock.isAdmin).thenReturn(false);
    when(personMock.positions).thenReturn([1]); 
    const person = instance(personMock);

    // when
    let actual = service.getAccessByPerson(object, person);

    // then
    expect(actual).toEqual(AccessLevel.None);
  });

  it('should get none access if person is deleted', () => {
    // given
    const objectMock = mock<IObject>();
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    when(personMock.isAdmin).thenReturn(false);
    when(personMock.isDeleted).thenReturn(true);
    const person = instance(personMock);

    // when
    let actual = service.getAccessByPerson(object, person);

    // then
    expect(actual).toEqual(AccessLevel.None);
  });

  it('should get access level for person with expired access', () => {
    // given
    const objectMock = mock<IObject>();
    
    const accessRecord = new AccessRecord();
    const access = new Access();
    access.accessLevel = AccessLevel.View;
    access.isInheritable = false;
    access.validThrough = new Date(9999, 12);
    accessRecord.access = access;
    accessRecord.orgUnitId = 1;

    const expiredAccessRecord = new AccessRecord();
    const expiredAccess = new Access();
    expiredAccess.accessLevel = AccessLevel.Full;
    expiredAccess.isInheritable = false;
    expiredAccess.validThrough = new Date(1999, 12);
    expiredAccessRecord.access = access;
    expiredAccessRecord.orgUnitId = 1;

    when(objectMock.access).thenReturn([accessRecord, expiredAccessRecord]);
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    when(personMock.isAdmin).thenReturn(false);
    when(personMock.isDeleted).thenReturn(false);
    when(personMock.allOrgUnits).thenReturn([1]);
    const person = instance(personMock);

    // when
    const actual = service.getAccessByPerson(object, person);

    // then
    expect(actual).toEqual(AccessLevel.View);
  });

  it('should get access level for person with many access records', () => {
    // given
    const objectMock = mock<IObject>();
    
    const accessRecord = new AccessRecord();
    const access = new Access();
    access.accessLevel = AccessLevel.View;
    access.isInheritable = false;
    access.validThrough = new Date(9999, 12);
    accessRecord.access = access;
    accessRecord.orgUnitId = 1;

    const otherAccessRecord = new AccessRecord();
    const otherAccess = new Access();
    otherAccess.accessLevel = AccessLevel.Full;
    otherAccess.isInheritable = false;
    otherAccess.validThrough = new Date(9999, 12);
    otherAccessRecord.access = access;
    otherAccessRecord.orgUnitId = 10; // access to other person

    when(objectMock.access).thenReturn([accessRecord, otherAccessRecord]);
    const object = instance(objectMock);
    
    const personMock = mock<IPerson>();
    when(personMock.isAdmin).thenReturn(false);
    when(personMock.isDeleted).thenReturn(false);
    when(personMock.allOrgUnits).thenReturn([1]);
    const person = instance(personMock);

    // when
    const actual = service.getAccessByPerson(object, person);

    // then
    expect(actual).toEqual(AccessLevel.View);
  });
});