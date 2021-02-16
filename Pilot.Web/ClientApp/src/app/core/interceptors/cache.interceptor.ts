import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestType } from '../headers.provider';


@Injectable({providedIn:'root'})
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, any>();

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    if (request.headers.get('RequestType') === RequestType.FromCache.toString()) {
      const cachedResponse = this.cache.get(request.url);
      if (cachedResponse) {
        return of(cachedResponse);
      }
    }
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(request.url, event);
        }
      })
    );
  }
}
