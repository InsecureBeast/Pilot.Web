import { Injectable, Inject } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Headers } from '@angular/http';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class FilesRepositoryService {

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL')
    private baseUrl: string,
    private authService: AuthService) {

  }

  getDocumentPagesCount(id: string, size: number, scale: number): Observable<number> {
    let headers = this.getHeaders();
    return this.http.get<number>(this.baseUrl + 'api/Files/GetDocumentPagesCount?fileId=' + id + '&size=' + size + '&scale=' + scale, { headers: headers.toJSON() }).pipe(first());
  }

  getDocumentPageContent(id: string, page: number): Observable<ArrayBuffer> {
    const token = this.authService.getToken();
    const headers = new Headers();
    headers.append('Authorization', "Bearer " + token);
    headers.append('Content-Type', 'application/octet-stream');
    const path = this.baseUrl + 'api/Files/GetDocumentPageContent?fileId=' + id + '&page=' + page;
    return this.http.get(path, { responseType: 'arraybuffer', headers: headers.toJSON() }).pipe(first());
  }

  getDocumentContent(id: string, size: number, scale: number, fileName: string): Observable<string[]> {
    let headers = this.getHeaders();
    return this.http.get<string[]>(this.baseUrl + 'api/Files/GetDocumentContent?fileId=' + id + '&size=' + size + '&scale=' + scale, { headers: headers.toJSON() }).pipe(first());
  }

  getFile(id: string, size: number): Observable<ArrayBuffer> {
    const token = this.authService.getToken();
    const headers = new Headers();
    headers.append('Authorization', "Bearer " + token);
    headers.append('Content-Type', 'application/octet-stream');

    const path = this.baseUrl + 'api/Files/GetFile?fileId=' + id + '&size=' + size;
    return this.http.get(path, { responseType: 'arraybuffer', headers: headers.toJSON() }).pipe(first());
  }

  getThumbnail(id: string, size: number): Observable<ArrayBuffer> {
    const token = this.authService.getToken();
    const headers = new Headers();
    headers.append('Authorization', "Bearer " + token);
    headers.append('Content-Type', 'application/octet-stream');

    const path = this.baseUrl + 'api/Files/GetThumbnail?fileId=' + id + '&size=' + size;
    return this.http.get(path, { responseType: 'arraybuffer', headers: headers.toJSON() }).pipe(first());
  }

  getFileArchive(ids: string[]): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      let body = JSON.stringify(ids);
      const headers = this.getHeaders();
      const path = this.baseUrl + 'api/Files/GetFileArchive';
      this.http.post(path, body, { responseType: 'arraybuffer', headers: headers.toJSON() })
        .pipe(first())
        .subscribe(archive => resolve(archive), err => reject(err));
    });
  }

  private getHeaders(): Headers {
    const token = this.authService.getToken();
    let headers = new Headers();
    headers.append('Authorization', "Bearer " + token);
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
