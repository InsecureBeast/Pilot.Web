import { Injectable, Inject } from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders, HttpRequest} from '@angular/common/http';
import { Observable } from 'rxjs';
import { buffer, first } from 'rxjs/operators';
import { HeadersProvider } from './headers.provider';
import {environment} from '../../environments/environment';
import {TranslateService} from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class FilesRepositoryService {

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL')
    private baseUrl: string,
    private readonly headersProvider: HeadersProvider,
    private translate: TranslateService) {

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

  getFileAsync(id: string, size: number): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      this.getFile(id, size).subscribe(buffer => resolve(buffer), er => reject(er));
    });
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

  uploadFiles(parentId: string, files: FileList, progressFunc: (progress: number) => void): Promise<string[]> {
    const formData = new FormData();
    for (let j = 0; j < files.length; j++) {
      const file = files.item(j);
      if (file.size > environment.uploadingFileMaxSizeBytes) {
        throw new Error(`${this.translate.instant('maxFileSizeInfo')} ${environment.uploadingFileMaxSizeMegaBytes} MB.`);
      }
      formData.append(file.name, file);
    }

    const headers = this.headersProvider.getAuthHeader();
    const uploadReq = new HttpRequest('POST', `${this.baseUrl}api/Files/UploadFiles/${parentId}`, formData, {
      reportProgress: true,
      headers
    });

    return new Promise<string[]>((resolve, reject) => this.http.request<string[]>(uploadReq).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          progressFunc(Math.round(100 * event.loaded / event.total));
        } else if (event.type === HttpEventType.Response) {
          const fileIds = event.body as string[];
          resolve(fileIds);
        }
      },
      error => reject(error)
    ));
  }
}
