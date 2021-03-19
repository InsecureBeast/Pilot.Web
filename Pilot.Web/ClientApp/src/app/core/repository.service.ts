import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, zip,  BehaviorSubject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { IMetadata, IObject, IType, IPerson, IOrganizationUnit, IUserState,
  IUserStateMachine, MUserStateMachine, IXpsDigitalSignature, IDatabaseInfo, DocumentSignData } from './data/data.classes';
import { RequestType, HeadersProvider } from './headers.provider';
import { Change } from './modifier/change';
import { Modifier } from './modifier/modifier';

@Injectable({ providedIn: 'root' })
export class RepositoryService {
  private metadata: IMetadata;
  private databaseInfo: IDatabaseInfo;
  private types: Map<number, IType>;
  private people: Map<number, IPerson>;
  private organizationUnits: Map<number, IOrganizationUnit>;
  private userStates: Map<string, IUserState>;
  private currentPerson: IPerson;
  private stateMachines: Map<string, MUserStateMachine>;
  private requestType: RequestType; // TODO remove from here

  constructor(private http: HttpClient,
              @Inject('BASE_URL')
              private baseUrl: string,
              private readonly headersProvider: HeadersProvider) {

    this.types = new Map<number, IType>();
    this.people = new Map<number, IPerson>();
    this.organizationUnits = new Map<number, IOrganizationUnit>();
    this.userStates = new Map<string, IUserState>();
    this.stateMachines = new Map<string, MUserStateMachine>();
  }

  setRequestType(value: RequestType) {
    this.headersProvider.requestType = value;
  }

  getRequestType(): RequestType {
    return this.headersProvider.requestType;
  }

  getType(id: number): IType {
    return this.types.get(id);
  }

  getTypes(): IType[] {
    return this.metadata.types;
  }

  getMetadata(): Observable<IMetadata> {
    const headers = this.headersProvider.getHeaders();
    return this.http.get<IMetadata>(this.baseUrl + 'api/Metadata/GetMetadata', { headers: headers });
  }

  getChildrenAsync(
    objectId: string,
    childrenType: number,
    cancel: Subject<any>,
    requestType: RequestType = RequestType.None): Promise<IObject[]> {

    let headers = this.headersProvider.getHeaders();
    headers = this.SetRequestType(requestType, headers);

    return new Promise((resolve, reject) => {
      const url = 'api/Documents/GetDocumentChildren?id=' + objectId + '&childrenType=' + childrenType;
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
    headers = this.SetRequestType(requestType, headers);
    return new Promise((resolve, reject) => {
      this.http
        .get<IObject>(this.baseUrl + 'api/Documents/GetObject?id=' + id, { headers: headers })
        .pipe(first())
        .subscribe((objects) => resolve(objects), e => reject(e));
    });
  }

  private SetRequestType(requestType: RequestType, headers) {
    if (requestType !== RequestType.None) {
      const currentRequestType = this.requestType;
      this.requestType = requestType;
      headers = this.headersProvider.getHeaders();
      this.requestType = currentRequestType;
    }
    return headers;
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

  getDocumentSignaturesAsync(id: string, cancel: Subject<any>): Promise<IXpsDigitalSignature[]> {
    return new Promise((resolve, reject) => {
      const headers = this.headersProvider.getHeaders();
      const url = `api/Documents/GetDocumentSignatures?documentId=${id}`;
      this.http
        .get<IXpsDigitalSignature[]>(this.baseUrl + url, { headers: headers })
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe((objects) => resolve(objects), e => reject(e));
    });
  }

  getDocumentSignaturesWithSnapshotAsync(id: string, snapshotDate: string, cancel: Subject<any>): Promise<IXpsDigitalSignature[]> {
    return new Promise((resolve, reject) => {
      const headers = this.headersProvider.getHeaders();
      const url = `api/Documents/GetDocumentSignaturesWithSnapshot?documentId=${id}&snapshotDate=${snapshotDate}`;
      this.http
        .get<IXpsDigitalSignature[]>(this.baseUrl + url, { headers: headers })
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe((objects) => resolve(objects), e => reject(e));
    });
  }

  initialize(): Observable<boolean> {
    const init = new BehaviorSubject<boolean>(false);
    if (this.metadata) {
      init.next(true);
      return init;
    }

    const metadata$ = this.getMetadata();
    const people$ = this.getPeople();
    const organizationUnits$ = this.getOrganizationUnits();
    const currentPerson$ = this.getCurrentPersonInternal();
    const states$ = this.getUserStates();
    const databaseInfo$ = this.getDatabaseInfo();

    const zip$ = zip(metadata$, people$, organizationUnits$, currentPerson$, states$, databaseInfo$).subscribe(
      ([metadata, people, organizationUnits, currentPerson, states, databaseInfo]) => {
        this.metadata = metadata;
        this.types = new Map<number, IType>();
        for (const attr of this.metadata.types) {
          this.types.set(attr.id, attr);
        }

        this.people = new Map<number, IPerson>();
        for (const person of people) {
          this.people.set(person.id, person);
        }

        this.organizationUnits = new Map<number, IOrganizationUnit>();
        for (const unit of organizationUnits) {
          this.organizationUnits.set(unit.id, unit);
        }

        this.currentPerson = currentPerson;

        this.userStates = new Map<string, IUserState>();
        for (const state of states) {
          this.userStates.set(state.id, state);
        }

        this.stateMachines = new Map<string, MUserStateMachine>();
        for (const stateMachine of metadata.stateMachines) {
          this.stateMachines.set(stateMachine.id, new MUserStateMachine(stateMachine));
        }

        this.databaseInfo = databaseInfo;

        init.next(true);
        init.complete();
        zip$.unsubscribe();
      }, err => {
        init.error(err);
      });

    return init;
  }

  clear() {
    this.currentPerson = null;
    this.metadata = null;
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

  getDatabaseId(): string {
    return this.databaseInfo.databaseId;
  }

  getPersonOnOrganizationUnit(positionId: number): IPerson {
    const orgUnit = this.getOrganizationUnit(positionId);
    let person: IPerson;
    if (orgUnit.person !== -1) {
      person = this.getPerson(orgUnit.person);
    }

    if (person) {
      return person;
    }

    if (!orgUnit.vicePersons) {
      return null;
    }

    for (const vicePerson of orgUnit.vicePersons) {
      person = this.getPerson(vicePerson);
      if (person != null && !person.isInactive) {
        return person;
      }
    }

    return null;
  }

  getUserState(id: string): IUserState {
    return this.userStates.get(id);
  }

  getStateMachine(id: string): IUserStateMachine {
    if (!this.stateMachines.has(id)) {
      return MUserStateMachine.Null;
    }
    return this.stateMachines.get(id);
  }

  applyChange(changes: Change[]): Observable<any> {
    const headers = this.headersProvider.getHeaders();
    const body = JSON.stringify(changes);
    return this.http.post<any>(this.baseUrl + 'api/Modifier/Change', body, { headers: headers }).pipe(first());
  }

  newModifier(): Modifier {
    return new Modifier(this);
  }

  signDocumentAsync(id: string, positionIds: number[], cancel: Subject<any>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const data = new DocumentSignData();
      data.documentId = id;
      data.positions = positionIds;
      const headers = this.headersProvider.getHeaders();
      const url = 'api/Documents/SignDocument';
      this.http
        .post<boolean>(this.baseUrl + url, data, { headers: headers })
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe((result) => resolve(result), e => reject(e));
    });
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

  private getDatabaseInfo(): Observable<IDatabaseInfo> {
    const headers = this.headersProvider.getHeaders();
    return this.http.get<IDatabaseInfo>(this.baseUrl + 'api/Metadata/GetDatabaseInfo', { headers: headers }).pipe(first());
  }
}
