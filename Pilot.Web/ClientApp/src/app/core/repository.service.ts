import { Injectable, Inject } from '@angular/core';
import { IMetadata, IObject, IType, IPerson, IOrganizationUnit, IUserState } from './data/data.classes';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, zip,  BehaviorSubject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export enum RequestType {
  New = 0,
  FromCache = 1
}

@Injectable({ providedIn: 'root', })
export class RepositoryService {

  private metadata: IMetadata;
  private types: Map<number, IType>;
  private typeNames: Map<string, IType>;
  private people: Map<number, IPerson>;
  private organizationUnits: Map<number, IOrganizationUnit>;
  private userStates: Map<string, IUserState>;
  private currentPerson: IPerson;

  private behaviorInitializedSubject = new BehaviorSubject<boolean>(false);

  initialized = this.behaviorInitializedSubject.value;
  onInitialized$ = this.behaviorInitializedSubject;

  private _requestType: RequestType = RequestType.New;
  set requestType(value: RequestType) {
    this._requestType = value;
  }
  get requestType(): RequestType {
    return this._requestType;
  }

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private authService: AuthService) {
    this.types = new Map<number, IType>();
    this.typeNames = new Map<string, IType>();
    this.people = new Map<number, IPerson>();
    this.organizationUnits = new Map<number, IOrganizationUnit>();
    this.userStates = new Map<string, IUserState>();

    this.initializeAsync();
  }

  getType(id: number): IType {
    return this.types.get(id);
  }

  getTypeByName(name: string): IType {
    return this.typeNames.get(name);
  }

  getMetadata(): Observable<IMetadata> {
    const headers = this.getHeaders();
    return this.http.get<IMetadata>(this.baseUrl + 'api/Metadata/GetMetadata', { headers: headers });
  }

  getChildrenAsync(objectId: string, childrenType: number, cancel: Subject<any>): Promise<IObject[]> {
    return new Promise((resolve, reject) => {
      let headers = this.getHeaders();
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
      let headers = this.getHeaders();
      let url = 'api/Documents/GetDocumentParents?id=' + id;
      this.http
        .get<IObject[]>(this.baseUrl + url, { headers: headers })
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe((objects) => resolve(objects), e => reject(e));
    });
  }

  getObjectAsync(id: string): Promise<IObject> {
    let headers = this.getHeaders();
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
      const headers = this.getHeaders();
      const path = this.baseUrl + 'api/Documents/GetObjects';
      this.http
        .post<IObject[]>(path, body, { headers: headers })
        .pipe(first())
        .subscribe(objects => resolve(objects), err => reject(err));
    });
  }

  initializeAsync(): Observable<boolean> {
    const init = new BehaviorSubject<boolean>(false);
    if (!this.isAuth())
      return init;

    if (this.metadata)
      return new BehaviorSubject<boolean>(true);

    const metadata$ = this.getMetadata();
    const people$ = this.getPeople();
    const organizationUnits$ = this.getOrganizationUnits();
    const currentPerson$ = this.getCurrentPersonInternal();
    const states$ = this.getUserStates();

    const zip$ = zip(metadata$, people$, organizationUnits$, currentPerson$, states$).subscribe(
      ([metadata, people, organizationUnits, currentPerson, states]) => {
        this.metadata = metadata;
        this.types = new Map<number, IType>();
        this.typeNames = new Map<string, IType>();
        for (let type of this.metadata.types) {
          this.types.set(type.id, type);
          this.typeNames.set(type.name, type);
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

        init.next(true);
        init.complete();
        zip$.unsubscribe();
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

  private getPeople(): Observable<IPerson[]> {
    const headers = this.getHeaders();
    return this.http.get<IPerson[]>(this.baseUrl + 'api/Metadata/GetPeople', { headers: headers }).pipe(first());
  }

  private getCurrentPersonInternal(): Observable<IPerson> {
    const headers = this.getHeaders();
    return this.http.get<IPerson>(this.baseUrl + 'api/Metadata/GetCurrentPerson', { headers: headers }).pipe(first());
  }

  private getOrganizationUnits(): Observable<IOrganizationUnit[]> {
    const headers = this.getHeaders();
    return this.http.get<IOrganizationUnit[]>(this.baseUrl + 'api/Metadata/GetOrganizationUnits', { headers: headers }).pipe(first());
  }

  private getUserStates(): Observable<IUserState[]> {
    const headers = this.getHeaders();
    return this.http.get<IUserState[]>(this.baseUrl + 'api/Metadata/GetUserStates', { headers: headers }).pipe(first());
  }

  private getHeaders(): HttpHeaders {
    const requestHeader = this.getRequestTypeHeader();
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': "Bearer " + token,
      'Content-Type': 'application/json',
      'RequestType': requestHeader
  });
    return headers;
  }

  private getRequestTypeHeader() {
    if (this.requestType === RequestType.New)
      return "new";
    if (this.requestType === RequestType.FromCache)
      return "fromCache";

    return "";
  }

  private isAuth(): boolean {
    return this.authService.getToken() != null;
  }
}
