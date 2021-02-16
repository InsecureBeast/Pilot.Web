import { Injectable } from '@angular/core';

import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { IndexedStorageService } from '../indexed-storage.service';
import { Tools } from '../tools/tools';

@Injectable({ providedIn: 'root' })
export class ImagesCacheInterceptor implements HttpInterceptor {
  constructor(private indexedStorage: IndexedStorageService) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    if (this.shouldBeIntercepted(request)) {
      const fileId = this.getParam(request.url, 'fileId');
      if (fileId !== null) {
        const promise = this.indexedStorage.getImageFile(fileId).then(value => {
          if (value) {
            return new HttpResponse({ status: 200, body: Tools.base64ToArrayBuffer(value) });
          }

          return this.next(request, next).toPromise();
        });

        const observable = from(promise);
        return observable;
      }
    }

    return this.next(request, next);
  }

  private next(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          if (this.shouldBeIntercepted(request)) {
            const fileId = this.getParam(request.url, 'fileId');
            if (fileId !== null) {
              const fileBody = event.body;
              this.indexedStorage.setImageFile(fileId, Tools.arrayBufferToBase64(fileBody));
            }
          }
        }
      })
    );
  }

  private shouldBeIntercepted(request: HttpRequest<any>): boolean {
    return request.url.indexOf("GetThumbnail") !== -1 || request.url.indexOf("GetFile") !== -1;
  }

  // parses the query string
  private parseQueryString(queryString: string): any {
    // if the query string is NULL or undefined
    const params = {};
    const q = queryString.split("?");
    if (q.length >= 2) {
      const queries = q[1].split("&");
      queries.forEach((indexQuery: string) => {
        const indexPair = indexQuery.split("=");

        const queryKey = decodeURIComponent(indexPair[0]);
        const queryValue = decodeURIComponent(indexPair.length > 1 ? indexPair[1] : "");

        params[queryKey] = queryValue;
      });
    }

    return params;
  }

  private getParam(url: string, param: string): string {
    const params = this.parseQueryString(url);
    if (params.length !== 0) {
      return params[param];
    }
    return null;
  }
}
