import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { HeadersProvider } from './headers.provider';

@Injectable({ providedIn: 'root' })
export class FilesRepositoryService {

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL')
    private baseUrl: string,
    private readonly headersProvider: HeadersProvider) {

  }

  getDocumentPagesCount(id: string, size: number, scale: number): Observable<number> {
    const headers = this.headersProvider.getHeaders();
    const url = 'api/Files/GetDocumentPagesCount?fileId=' + id + '&size=' + size + '&scale=' + scale;
    return this.http.get<number>(this.baseUrl + url, { headers: headers }).pipe(first());
  }

  getDocumentPageContent(id: string, page: number): Observable<ArrayBuffer> {
    const headers = this.headersProvider.getStreamHeaders();
    const path = this.baseUrl + 'api/Files/GetDocumentPageContent?fileId=' + id + '&page=' + page;
    return this.http.get(path, { headers: headers, responseType: 'arraybuffer' }).pipe(first());
  }

  getDocumentFile(documentId: string): Observable<ArrayBuffer> {
    const headers = this.headersProvider.getStreamHeaders();
    const path = this.baseUrl + 'api/Files/GetDocumentFile?documentId=' + documentId;
    return this.http.get(path, { responseType: 'arraybuffer', headers: headers }).pipe(first());
  }

  getFile(id: string, size: number): Observable<ArrayBuffer> {
    const headers = this.headersProvider.getStreamHeaders();
    const path = this.baseUrl + 'api/Files/GetFile?fileId=' + id + '&size=' + size;
    return this.http.get(path, { responseType: 'arraybuffer', headers: headers }).pipe(first());
  }

  getThumbnail(id: string, size: number): Observable<ArrayBuffer> {
    const headers = this.headersProvider.getStreamHeaders();
    const path = this.baseUrl + 'api/Files/GetThumbnail?fileId=' + id + '&size=' + size;
    return this.http.get(path, { responseType: 'arraybuffer', headers: headers }).pipe(first());
  }

  getFileArchive(ids: string[]): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify(ids);
      const headers = this.headersProvider.getHeaders();
      const path = this.baseUrl + 'api/Files/GetFileArchive';
      this.http.post(path, body, { responseType: 'arraybuffer', headers: headers })
        .pipe(first())
        .subscribe(archive => resolve(archive), err => reject(err));
    });
  }
}
