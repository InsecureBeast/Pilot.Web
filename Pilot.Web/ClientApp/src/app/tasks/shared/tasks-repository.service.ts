import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { IObject, ICommonSettings } from '../../core/data/data.classes';
import { AuthService } from '../../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class TasksRepositoryService {
  constructor(
    private readonly http: HttpClient,
    @Inject('BASE_URL')
    private readonly baseUrl: string,
    private readonly userService: AuthService) {

  }

  getPersonalSettings(key: string): Observable<ICommonSettings> {
    const headers = this.getHeaders();
    return this.http.get<ICommonSettings>(this.baseUrl + 'api/Metadata/GetPersonalSettings?key=' + key, { headers: headers })
      .pipe(first());
  }

  getTasks(filter: string): Observable<IObject[]> {
    const body = JSON.stringify(filter);
    const headers = this.getHeaders();
    const path = this.baseUrl + 'api/Tasks/GetTasks';
    return this.http.post<IObject[]>(path, body, { headers: headers })
      .pipe(first());
  }

  private getHeaders(): HttpHeaders {
    const token = this.userService.getToken();
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': "Bearer " + token,
      'Content-Type': 'application/json'
    });
    return headers;
  }
}
