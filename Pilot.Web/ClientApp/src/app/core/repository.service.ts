import { Injectable, Inject } from '@angular/core';
import { IMetadata, IObject, IType, IPerson, IOrganizationUnit, IUserState } from './data/data.classes';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, combineLatest } from 'rxjs';
import { first, takeUntil, map, take, skip } from 'rxjs/operators';
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

  public initialized = this.behaviorInitializedSubject.asObservable();

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string, private authService: AuthService) {
    this.types = new Map<number, IType>();
    this.people = new Map<number, IPerson>();
    this.organizationUnits = new Map<number, IOrganizationUnit>();
    this.userStates = new Map<string, IUserState>();
  }

  public getType(id: number): IType {
    return this.types.get(id);
  }

  getMetadata(): Observable<IMetadata> {
    let headers = this.getHeaders();
    return this.http.get<IMetadata>(this.baseUrl + 'api/Metadata/GetMetadata', { headers: headers.toJSON() });
  }

  public getChildrenAsync(objectId: string, childrenType: number, cancel: Subject<any>): Promise<IObject[]> {
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

  public getObjectParentsAsync(id: string, cancel: Subject<any>): Promise<IObject[]> {
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

  public getObjectAsync(id: string): Promise<IObject> {
    let headers = this.getHeaders();
    return new Promise((resolve, reject) => {
      this.http
        .get<IObject>(this.baseUrl + 'api/Documents/GetObject?id=' + id, { headers: headers.toJSON() })
        .pipe(first())
        .subscribe((objects) => resolve(objects), e => reject(e));
    });
  }

  public getObjectsAsync(ids: string[]): Promise<IObject[]> {
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

    const initSubject = new BehaviorSubject<boolean>(false);
    initSubject.asObservable().pipe(skip(5)).subscribe((c) => {
      init.next(true);
    });
    
    //let metadata$ = this.getMetadata();
    //let people$ = this.getPeople();
    //let organizationUnits$ = this.getOrganizationUnits();
    //let currentPerson$ = this.getCurrentPersonInternal();
    //let states$ = this.getUserStates();

    this.getMetadata().pipe(first()).subscribe(meta => {
      this.metadata = meta;
      for (let attr of this.metadata.types) {
        this.types.set(attr.id, attr);
      }

      initSubject.next(true);
    });

    this.getPeople().pipe(first()).subscribe(people => {
      for (let person of people) {
        this.people.set(person.id, person);
      }

      initSubject.next(true);
    });

    this.getOrganizationUnits().pipe(first()).subscribe(organizationUnits => {
      for (let unit of organizationUnits) {
        this.organizationUnits.set(unit.id, unit);
      }

      initSubject.next(true);
    });

    this.getCurrentPersonInternal().pipe(first()).subscribe(person => {
      this.currentPerson = person;
      initSubject.next(true);
    });

    this.getUserStates().pipe(first()).subscribe(states => {
      for (let state of states) {
        this.userStates.set(state.id, state);
      }
      initSubject.next(true);
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

  //private getPeopleAsync(): Promise<IPerson[]> {
  //  return new Promise((resolve, reject) => {
  //    const headers = this.getHeaders();
  //    this.http
  //      .get<IPerson[]>(this.baseUrl + 'api/Metadata/GetPeople', { headers: headers.toJSON() })
  //      .pipe(first())
  //      .subscribe(people => resolve(people), err => reject(err));
  //  });
  //}

  //private getCurrentPersonAsync(): Promise<IPerson> {
  //  return new Promise((resolve, reject) => {
  //    const headers = this.getHeaders();
  //    this.http
  //      .get<IPerson>(this.baseUrl + 'api/Metadata/GetCurrentPerson', { headers: headers.toJSON() })
  //      .pipe(first())
  //      .subscribe(person => resolve(person), err => reject(err));
  //  });
  //}

  //private getOrganizationUnitsAsync(): Promise<IOrganizationUnit[]> {
  //  return new Promise((resolve, reject) => {
  //    const headers = this.getHeaders();
  //    this.http
  //      .get<IOrganizationUnit[]>(this.baseUrl + 'api/Metadata/GetOrganizationUnits', { headers: headers.toJSON() })
  //      .pipe(first())
  //      .subscribe(units => resolve(units), err => reject(err));
  //  });
  //}

  //private getUserStatesAsync(): Promise<IUserState[]> {
  //  return new Promise((resolve, reject) => {
  //    const headers = this.getHeaders();
  //    this
  //      .http.get<IUserState[]>(this.baseUrl + 'api/Metadata/GetUserStates', { headers: headers.toJSON() })
  //      .pipe(first())
  //      .subscribe(userStates => resolve(userStates), err => reject(err));
  //  });
  //}

  private getHeaders(): Headers {
    let token = this.authService.getToken();
    let headers = new Headers();
    headers.append('Authorization', "Bearer " + token);
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
