import { Injectable, EventEmitter } from '@angular/core';
import { SearchApi } from './search.api';
import { Subject, ReplaySubject } from 'rxjs';
import { IObject } from '../data/data.classes';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SearchService {

    private _searchResults$ = new ReplaySubject<IObject[]>(1);

    searchResults$ = this._searchResults$.asObservable();
    error = new EventEmitter<HttpErrorResponse>();
    isSearchInputShown: boolean;

    constructor(private readonly searchApi: SearchApi) {
    }

    searchObjects(request: string, isContextSearch: boolean, contextObjectId: string, cancel: Subject<any>): void {
        this.searchApi.searchObjectsAsync(request, isContextSearch, contextObjectId, cancel)
        .then(objects => this._searchResults$.next(objects))
        .catch((e) => {
            this.error?.emit(e);
        });
        // .finally(() => this._searchResults$.complete());
    }
}
