import { Injectable } from '@angular/core';
import { SearchApi } from './search.api';
import { Subject, BehaviorSubject } from 'rxjs';
import { IObject } from '../data/data.classes';
import { ErrorHandlerService } from 'src/app/components/error/error-handler.service';

@Injectable({ providedIn: 'root' })
export class SearchService {

    private _inSearchMode$ = new BehaviorSubject<boolean>(false);
    private _searchResults$ = new BehaviorSubject<IObject[]>(new Array());

    inSearchMode$ = this._inSearchMode$.asObservable();
    searchResults$ = this._searchResults$.asObservable();
    isSearchInputShown: boolean;

    constructor(private readonly searchApi: SearchApi, private readonly eroorHandlerService: ErrorHandlerService) {
    }

    searchObjects(request: string, cancel: Subject<any>): void {
        this.searchApi.searchObjectsAsync(request, cancel)
        .then(objects => this._searchResults$.next(objects))
        .catch((e) => this.eroorHandlerService.handleErrorMessage(e));
        // .finally(() => this._searchResults$.complete());
    }
}
