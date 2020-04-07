import { Injectable, Inject } from '@angular/core';
import { IMetadata, IObject, IType, IPerson, IOrganizationUnit, IUserState } from './data/data.classes';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, combineLatest , zip} from 'rxjs';
import { first, takeUntil, map, take, skip} from 'rxjs/operators';
import { Headers } from '@angular/http';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root', })
export class RepositoryService {

  private metadata: IMetadata;
  private types: Map<number, IType>;
  private people: Map<number, IPerson>;
  private organizationUnits: Map<number, IOrganizationUnit>;
  private userStates: Map<string, IUserState>;
  private currentPerson: IPerson;

  private behaviorInitializedSubject = new BehaviorSubject<boolean>(false);

  initialized = this.behaviorInitializedSubject.value;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private authService: AuthService) {
    this.types = new Map<number, IType>();
    this.people = new Map<number, IPerson>();
    this.organizationUnits = new Map<number, IOrganizationUnit>();
    this.userStates = new Map<string, IUserState>();

    this.initializeAsync();
  }

  getType(id: number): IType {
    return this.types.get(id);
  }

  getMetadata(): Observable<IMetadata> {
    let headers = this.getHeaders();
    return this.http.get<IMetadata>(this.baseUrl + 'api/Metadata/GetMetadata', { headers: headers.toJSON() });
  }

  getChildrenAsync(objectId: string, childrenType: number, cancel: Subject<any>): Promise<IObject[]> {
    return new Promise((resolve, reject) => {
      let headers = this.getHeaders();
      let url = 'api/Documents/GetDocumentChildren?id=' + objectId + "&childrenType=" + childrenType;
      this.http
        .get<IObject[]>(this.baseUrl + url, { headers: headers.toJSON() })
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
        .get<IObject[]>(this.baseUrl + url, { headers: headers.toJSON() })
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe((objects) => resolve(objects), e => reject(e));
    });
  }

  getObjectAsync(id: string): Promise<IObject> {
    let headers = this.getHeaders();
    return new Promise((resolve, reject) => {
      this.http
        .get<IObject>(this.baseUrl + 'api/Documents/GetObject?id=' + id, { headers: headers.toJSON() })
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
        .post<IObject[]>(path, body, { headers: headers.toJSON() })
        .pipe(first())
        .subscribe(objects => resolve(objects), err => reject(err));
    });
  }

  initializeAsync(): Observable<boolean> {
        
    const init = new BehaviorSubject<boolean>(false);

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
    return this.http.get<IPerson[]>(this.baseUrl + 'api/Metadata/GetPeople', { headers: headers.toJSON() }).pipe(first());
  }

  private getCurrentPersonInternal(): Observable<IPerson> {
    const headers = this.getHeaders();
    return this.http.get<IPerson>(this.baseUrl + 'api/Metadata/GetCurrentPerson', { headers: headers.toJSON() }).pipe(first());
  }

  private getOrganizationUnits(): Observable<IOrganizationUnit[]> {
    const headers = this.getHeaders();
    return this.http.get<IOrganizationUnit[]>(this.baseUrl + 'api/Metadata/GetOrganizationUnits', { headers: headers.toJSON() }).pipe(first());
  }

  private getUserStates(): Observable<IUserState[]> {
    const headers = this.getHeaders();
    return this.http.get<IUserState[]>(this.baseUrl + 'api/Metadata/GetUserStates', { headers: headers.toJSON() }).pipe(first());
  }

  private getHeaders(): Headers {
    let token = this.authService.getToken();
    let headers = new Headers();
    headers.append('Authorization', "Bearer " + token);
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
