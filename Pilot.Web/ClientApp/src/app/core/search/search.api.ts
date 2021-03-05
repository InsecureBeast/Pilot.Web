import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersProvider } from '../headers.provider';
import { IObject } from '../data/data.classes';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class SearchApi {
    constructor(private http: HttpClient,
        @Inject('BASE_URL')
        private baseUrl: string,
        private readonly headersProvider: HeadersProvider) {
    }

    searchObjectsAsync(request: string, cancel: Subject<any>): Promise<IObject[]> {
        return new Promise((resolve, reject) => {
            const headers = this.headersProvider.getNewHeaders();
            const url = 'api/Search/SearchObjects?searchRequest=' + request;
            this.http
              .get<IObject[]>(this.baseUrl + url, { headers: headers })
              .pipe(first())
              .pipe(takeUntil(cancel))
              .subscribe((objects) => resolve(objects), e => reject(e));
          });
      }
}
