import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { ITessellation } from './bim-data.classes';

@Injectable({ providedIn: 'root' })
export class BimFilesService {
  constructor(
    private http: HttpClient,
    @Inject('BASE_URL')
    private baseUrl: string,
    private authService: AuthService) {

  }

  getFileTessellationsAsync(modelPartId: string, id: string, size: number, cancel: Subject<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const headers = this.getHeaders();
      const url = 'api/Bim/GetFileTessellations?modelPartId=' + modelPartId + '&fileId=' + id + '&size=' + size;
      this.http
        .get<ITessellation[]>(this.baseUrl + url, { headers: headers, responseType: 'json' })
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe((objects) => resolve(objects), e => reject(e));
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': "Bearer " + token,
      'Content-Type': 'application/json'
    });
    return headers;
  }
}
