import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { ITessellation, IIfcNode, IIfcNodePropertySet } from './bim-data.classes';
import { HeadersProvider } from 'src/app/core/headers.provider';

@Injectable({ providedIn: 'root' })
export class BimFilesService {
  constructor(
    private http: HttpClient,
    @Inject('BASE_URL')
    private baseUrl: string,
    private authService: AuthService,
    private headersProvider: HeadersProvider) {

  }

  getModelPartTessellationsAsync(modelPartId: string, cancel: Subject<any>): Promise<ITessellation[]> {
    return new Promise((resolve, reject) => {
      const headers = this.headersProvider.getHeaders();
      const url = `api/Bim/GetTessellations?modelPartId=${modelPartId}`;
      this.http
        .get<ITessellation[]>(this.baseUrl + url, { headers: headers })
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe((objects) => resolve(objects), e => reject(e));
    });
  }

  getModelPartIfcNodesAsync(modelPartId: string, cancel: Subject<any>): Promise<IIfcNode[]> {
    return new Promise((resolve, reject) => {
      const headers = this.headersProvider.getHeaders();
      const url = `api/Bim/GetNodes?modelPartId=${modelPartId}`;
      this.http
        .get<IIfcNode[]>(this.baseUrl + url, { headers: headers })
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe((objects) => resolve(objects), e => reject(e));
    });
  }

  getNodePropertiesAsync(modelPartId: string, guid: string, cancel: Subject<any>): Promise<IIfcNodePropertySet[]> {
    return new Promise((resolve, reject) => {
      const headers = this.headersProvider.getHeaders();
      const url = `api/Bim/GetNodeProperties?modelPartId=${modelPartId}&nodeId=${guid}`;
      this.http
        .get<IIfcNodePropertySet[]>(this.baseUrl + url, { headers: headers })
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe((props) => resolve(props), e => reject(e));
    });
  }
}
