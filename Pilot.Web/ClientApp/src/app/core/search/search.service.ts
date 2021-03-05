import { Injectable } from '@angular/core';
import { SearchApi } from './search.api';
import { Subject, BehaviorSubject } from 'rxjs';
import { IObject } from '../data/data.classes';

@Injectable({ providedIn: 'root' })
export class SearchService {

    private _inSearchMode$ = new BehaviorSubject<boolean>(false);
    private _searchResults$ = new BehaviorSubject<IObject[]>(new Array());

    inSearchMode$ = this._inSearchMode$.asObservable();
    searchResults$ = this._searchResults$.asObservable();

    constructor(private readonly searchApi: SearchApi) {
    }

    searchObjects(request: string, cancel: Subject<any>): void {
        this.searchApi.searchObjectsAsync(request, cancel)
        .then(objects => this._searchResults$.next(objects))
        .catch((e) => this._searchResults$.error(e));
        // .finally(() => this._searchResults$.complete());
    }
}
