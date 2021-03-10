import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RepositoryService } from './repository.service';
import { HeadersProvider } from './headers.provider';
import { IMetadata, IOrganizationUnit, IPerson, ITransition, IType, IUserState, IUserStateMachine, MUserStateMachine } from './data/data.classes';
import { Change } from './modifier/change';
import { skipWhile } from 'rxjs/operators';

describe('RepositoryService', () => {
  let service: RepositoryService;
  let httpMock: HttpTestingController;
  let headersProvider: HeadersProvider;

  let metadata: IMetadata;
  let people = <IPerson[]> { };
  let organizationUnits = <IOrganizationUnit[]> {};
  let currentPerson = <IPerson> {};
  let states = <IUserState[]> {};

  const httpMockSetupExpects = function() {
    httpMock.expectOne({
      method: 'GET',
      url: 'http://localhost/api/Metadata/GetMetadata'
    }).flush(metadata);

    httpMock.expectOne({
      method: 'GET',
      url: 'http://localhost/api/Metadata/GetPeople'
    }).flush(people);

    httpMock.expectOne({
      method: 'GET',
      url: 'http://localhost/api/Metadata/GetOrganizationUnits'
    }).flush(organizationUnits);

    httpMock.expectOne({
      method: 'GET',
      url: 'http://localhost/api/Metadata/GetCurrentPerson'
    }).flush(currentPerson);

    httpMock.expectOne({
      method: 'GET',
      url: 'http://localhost/api/Metadata/GetUserStates'
    }).flush(states);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: 'BASE_URL', useValue: 'http://localhost/' },
        RepositoryService]
    });
    service = TestBed.inject(RepositoryService);
    httpMock = TestBed.inject(HttpTestingController);
    headersProvider = TestBed.inject(HeadersProvider);

    const type1 = <IType> { id: 1, title: 'Type1' };
    const type2 = <IType> { id: 2, title: 'Type2' };
    metadata = <IMetadata> { version: 2, types: [ type1, type2], stateMachines: [], userStates: [] };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize', () => {

    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      expect(isInit).toBeTrue();
    });

    httpMockSetupExpects();
  });

  it('should get metadata', () => {
    service.getMetadata().subscribe(actual => {
      expect(actual.version).toEqual(metadata.version);
    });

    httpMock.expectOne({
      method: 'GET',
      url: 'http://localhost/api/Metadata/GetMetadata'
    })
    .flush(metadata);
  });

  it('should get type', () => {
    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getType(2);
      // then
      expect(actual.id).toBe(2);
      expect(actual.title).toBe('Type2');
    });

    httpMockSetupExpects();
  });

  it('should return undefined if type not exists', () => {
    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getType(10);
      // then
      expect(actual).toBeUndefined();
    });

    httpMockSetupExpects();
  });

  it('should get person', () => {
    // given
    const person1 = <IPerson> { id: 1, displayName: 'Person1'};
    const person2 = <IPerson> { id: 2, displayName: 'Person2'};
    const person3 = <IPerson> { id: 3, displayName: 'Person3'};
    people = [person1, person2, person3];

    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getPerson(2);

      // then
      expect(actual.id).toBe(2);
      expect(actual.displayName).toBe('Person2');
    });

    httpMockSetupExpects();
  });

  it('should get undefined if person not exists', () => {
    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getPerson(20);

      // then
      expect(actual).toBeUndefined();
    });

    httpMockSetupExpects();
  });

  it('should get current person', () => {
    // given
    currentPerson = <IPerson> { id: 1, displayName: 'Person1'};

    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getCurrentPerson();

      // then
      expect(actual.id).toBe(1);
      expect(actual.displayName).toBe('Person1');
    });

    httpMockSetupExpects();
  });

  it('should get organization unit', () => {
    // given
    const orgUnit1 = <IOrganizationUnit> { id: 1, title: 'OrgUnit1'};
    const orgUnit2 = <IOrganizationUnit> { id: 2, title: 'OrgUnit2'};
    const orgUnit3 = <IOrganizationUnit> { id: 3, title: 'OrgUnit3'};
    organizationUnits = [orgUnit1, orgUnit2, orgUnit3];

    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getOrganizationUnit(3);

      // then
      expect(actual.id).toBe(3);
      expect(actual.title).toBe('OrgUnit3');
    });

    httpMockSetupExpects();
  });

  it('should get undefined organization unit if not exists', () => {
    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getOrganizationUnit(30);

      // then
      expect(actual).toBeUndefined();
    });

    httpMockSetupExpects();
  });

  it('should get person on organization unit', () => {
    // given
    const person = <IPerson> { id: 2, displayName: 'Person2'};
    people = [person];

    const orgUnit = <IOrganizationUnit> { id: 1, title: 'OrgUnit1', person: 2};
    organizationUnits = [orgUnit];

    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getPersonOnOrganizationUnit(1);

      // then
      expect(actual.id).toBe(2);
      expect(actual.displayName).toBe('Person2');
    });

    httpMockSetupExpects();
  });

  it('should not get person on organization unit', () => {
    // given
    const person = <IPerson> { id: 2, displayName: 'Person2'};
    people = [person];

    const orgUnit = <IOrganizationUnit> { id: 1, title: 'OrgUnit1', person: 4};
    organizationUnits = [orgUnit];

    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getPersonOnOrganizationUnit(1);

      // then
      expect(actual).toBeNull();
    });

    httpMockSetupExpects();
  });

  it('should get person on organization unit as vice person', () => {
    // given
    const person = <IPerson> { id: 2, displayName: 'Person2'};
    people = [person];

    const orgUnit = <IOrganizationUnit> { id: 1, title: 'OrgUnit1', person: -1, vicePersons: [2]};
    organizationUnits = [orgUnit];

    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getPersonOnOrganizationUnit(1);

      // then
      expect(actual.id).toBe(2);
      expect(actual.displayName).toBe('Person2');
    });

    httpMockSetupExpects();
  });

  it('should not get person on organization unit as vice person if is inactive', () => {
    // given
    const person = <IPerson> { id: 2, displayName: 'Person2', isInactive: true};
    people = [person];

    const orgUnit = <IOrganizationUnit> { id: 1, title: 'OrgUnit1', person: -1, vicePersons: [2]};
    organizationUnits = [orgUnit];

    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getPersonOnOrganizationUnit(1);

      // then
      expect(actual).toBeNull();
    });

    httpMockSetupExpects();
  });

  it('should get user state', () => {
    // given
    const userState1 = <IUserState> { id: 'guid1', name: 'UserState1', title: 'State1'};
    const userState2 = <IUserState> { id: 'guid2', name: 'UserState2', title: 'State2'};
    const userState3 = <IUserState> { id: 'guid3', name: 'UserState3', title: 'State3'};
    states = [ userState1, userState2, userState3];

    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getUserState('guid2');

      // then
      expect(actual).toEqual(userState2);
    });

    httpMockSetupExpects();
  });

  it('should get undefined user state if not exists', () => {
    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getUserState('guid20');

      // then
      expect(actual).toBeUndefined();
    });

    httpMockSetupExpects();
  });

  it('should get state machine', () => {
    // given
    const stateMachine1 = <IUserStateMachine> { id: 'guid1', title: 'StateMachine1', stateTransitions: new Map<string, ITransition[]>()};
    const stateMachine2 = <IUserStateMachine> { id: 'guid2', title: 'StateMachine2', stateTransitions: new Map<string, ITransition[]>()};
    const stateMachine3 = <IUserStateMachine> { id: 'guid3', title: 'StateMachine3', stateTransitions: new Map<string, ITransition[]>()};
    metadata.stateMachines = [ stateMachine1, stateMachine2, stateMachine3];

    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getStateMachine('guid2');

      // then
      expect(actual.id).toEqual(stateMachine2.id);
      expect(actual.title).toEqual(stateMachine2.title);
    });

    httpMockSetupExpects();
  });

  it('should get empty state machine', () => {
    // when
    service.initialize().pipe(skipWhile((v) => !v)).subscribe(isInit => {
      const actual = service.getStateMachine('guid2');

      // then
      expect(actual).toEqual(MUserStateMachine.Null);
    });

    httpMockSetupExpects();
  });

  it('should create new modifier', () => {
    // when
    const modifier1 = service.newModifier();
    const modifier2 = service.newModifier();

    // then
    expect(modifier1).not.toBe(modifier2);
  });

  it('should send apply changes', () => {
    // given
    const change = new Change('guid');
    const changes = [ change ];
    // when
    service.applyChange(changes).subscribe(res => {

    });
    // then
    const req = httpMock.expectOne(`http://localhost/api/Modifier/Change`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(JSON.stringify(changes));
    httpMock.verify();
  });
});
