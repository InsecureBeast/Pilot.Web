import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, zip,  BehaviorSubject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { IMetadata, IObject, IType, IPerson, IOrganizationUnit, IUserState, IUserStateMachine, MUserStateMachine } from './data/data.classes';
import { RequestType, HeadersProvider } from './headers.provider';
import { Change } from './modifier/change';
import { Modifier } from './modifier/modifier';

@Injectable({ providedIn: 'root' })
export class RepositoryService {

  private metadata: IMetadata;
  private types: Map<number, IType>;
  private people: Map<number, IPerson>;
  private organizationUnits: Map<number, IOrganizationUnit>;
  private userStates: Map<string, IUserState>;
  private currentPerson: IPerson;
  private stateMachines: Map<string, MUserStateMachine>;

  set requestType(value: RequestType) {
    this.headersProvider.requestType = value;
  }

  get requestType(): RequestType {
    return this.headersProvider.requestType;
  }

  constructor(private http: HttpClient, 
              @Inject('BASE_URL') private baseUrl: string, 
              private readonly headersProvider: HeadersProvider) {
    
     this.types = new Map<number, IType>();
    this.people = new Map<number, IPerson>();
    this.organizationUnits = new Map<number, IOrganizationUnit>();
    this.userStates = new Map<string, IUserState>();
    this.stateMachines = new Map<string, MUserStateMachine>();
  }

  getType(id: number): IType {
    return this.types.get(id);
  }

  getMetadata(): Observable<IMetadata> {
    const headers = this.headersProvider.getHeaders();
    return this.http.get<IMetadata>(this.baseUrl + 'api/Metadata/GetMetadata', { headers: headers });
  }

  getChildrenAsync(objectId: string, childrenType: number, cancel: Subject<any>): Promise<IObject[]> {
    return new Promise((resolve, reject) => {
      let headers = this.headersProvider.getHeaders();
      let url = 'api/Documents/GetDocumentChildren?id=' + objectId + "&childrenType=" + childrenType;
      this.http
        .get<IObject[]>(this.baseUrl + url, { headers: headers })
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe((objects) => resolve(objects), e => reject(e));
    });
  }

  getObjectParentsAsync(id: string, cancel: Subject<any>): Promise<IObject[]> {
    return new Promise((resolve, reject) => {
      const headers = this.headersProvider.getHeaders();
      const url = 'api/Documents/GetDocumentParents?id=' + id;
      this.http
        .get<IObject[]>(this.baseUrl + url, { headers: headers })
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe((objects) => resolve(objects), e => reject(e));
    });
  }

  getObjectAsync(id: string, requestType: RequestType = RequestType.None): Promise<IObject> {
    let headers = this.headersProvider.getHeaders();

    if (requestType !== RequestType.None){
      const currentRequestType = this.requestType;
      this.requestType = requestType;
      headers = this.headersProvider.getHeaders();
      this.requestType = currentRequestType;
    }
    return new Promise((resolve, reject) => {
      this.http
        .get<IObject>(this.baseUrl + 'api/Documents/GetObject?id=' + id, { headers: headers })
        .pipe(first())
        .subscribe((objects) => resolve(objects), e => reject(e));
    });
  }

  getObjectsAsync(ids: string[]): Promise<IObject[]> {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify(ids);
      const headers = this.headersProvider.getHeaders();
      const path = this.baseUrl + 'api/Documents/GetObjects';
      this.http
        .post<IObject[]>(path, body, { headers: headers })
        .pipe(first())
        .subscribe(objects => resolve(objects), err => reject(err));
    });
  }

  initialize(): Observable<boolean> {
    const init = new BehaviorSubject<boolean>(false);
    if (this.metadata){
      init.next(true);
      return init;
    }

    const metadata$ = this.getMetadata();
    const people$ = this.getPeople();
    const organizationUnits$ = this.getOrganizationUnits();
    const currentPerson$ = this.getCurrentPersonInternal();
    const states$ = this.getUserStates();

    const zip$ = zip(metadata$, people$, organizationUnits$, currentPerson$, states$).subscribe(
      ([metadata, people, organizationUnits, currentPerson, states]) => {
        this.metadata = metadata;
        this.types = new Map<number, IType>();
        for (let attr of this.metadata.types) {
          this.types.set(attr.id, attr);
        }

        this.people = new Map<number, IPerson>();
        for (let person of people) {
          this.people.set(person.id, person);
        }

        this.organizationUnits = new Map<number, IOrganizationUnit>();
        for (let unit of organizationUnits) {
          this.organizationUnits.set(unit.id, unit);
        }

        this.currentPerson = currentPerson;

        this.userStates = new Map<string, IUserState>();
        for (let state of states) {
          this.userStates.set(state.id, state);
        }

        this.stateMachines = new Map<string, MUserStateMachine>();
        for (let stateMachine of metadata.stateMachines) {
          this.stateMachines.set(stateMachine.id, new MUserStateMachine(stateMachine));
        }

        init.next(true);
        init.complete();
        zip$.unsubscribe();
      }, err => {
        init.error(err);
      });

    return init;
  }

  getPerson(id: number): IPerson {
    return this.people.get(id);
  }

  getCurrentPerson(): IPerson {
    return this.currentPerson;
  }

  getOrganizationUnit(id: number): IOrganizationUnit {
    return this.organizationUnits.get(id);
  }

  getPersonOnOrganizationUnit(positionId: number): IPerson {
    const orgUnit = this.getOrganizationUnit(positionId);
    let person: IPerson;
    if (orgUnit.person !== -1) {
      person = this.getPerson(orgUnit.person);
      if (person != null)
        return person;
    }

    for (let vicePerson of orgUnit.vicePersons) {
      person = this.getPerson(vicePerson);
      if (person != null && !person.isInactive)
        return person;
    }

    return null;
  }

  getUserState(id: string): IUserState {
    return this.userStates.get(id);
  }

  getStateMachine(id: string) : IUserStateMachine {
    if (!this.stateMachines.has(id))
      return MUserStateMachine.Null;
      
    return this.stateMachines.get(id);
  }

  applyChange(changes: Change[]): Observable<any> {
    const headers = this.headersProvider.getHeaders();
    const body = JSON.stringify(changes);
    return this.http.post<any>(this.baseUrl + 'api/Modifier/Change', body, { headers: headers }).pipe(first());
  }

  newModifier() : Modifier {
    return new Modifier(this);
  }

  private getPeople(): Observable<IPerson[]> {
    const headers = this.headersProvider.getHeaders();
    return this.http.get<IPerson[]>(this.baseUrl + 'api/Metadata/GetPeople', { headers: headers }).pipe(first());
  }

  private getCurrentPersonInternal(): Observable<IPerson> {
    const headers = this.headersProvider.getHeaders();
    return this.http.get<IPerson>(this.baseUrl + 'api/Metadata/GetCurrentPerson', { headers: headers }).pipe(first());
  }

  private getOrganizationUnits(): Observable<IOrganizationUnit[]> {
    const headers = this.headersProvider.getHeaders();
    return this.http.get<IOrganizationUnit[]>(this.baseUrl + 'api/Metadata/GetOrganizationUnits', { headers: headers }).pipe(first());
  }

  private getUserStates(): Observable<IUserState[]> {
    const headers = this.headersProvider.getHeaders();
    return this.http.get<IUserState[]>(this.baseUrl + 'api/Metadata/GetUserStates', { headers: headers }).pipe(first());
  }
}
