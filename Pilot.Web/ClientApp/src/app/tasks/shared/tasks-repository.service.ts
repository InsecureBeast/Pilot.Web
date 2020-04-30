import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Headers } from '@angular/http';

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
    return this.http.get<ICommonSettings>(this.baseUrl + 'api/Metadata/GetPersonalSettings?key=' + key, { headers: headers.toJSON() })
      .pipe(first());
  }

  getTasks(filter: string): Observable<IObject[]> {
    const body = JSON.stringify(filter);
    const headers = this.getHeaders();
    const path = this.baseUrl + 'api/Tasks/GetTasks';
    return this.http.post<IObject[]>(path, body, { headers: headers.toJSON() })
      .pipe(first());
  }


  private getHeaders(): Headers {
    const token = this.userService.getToken();
    const headers = new Headers();
    headers.append('Authorization', "Bearer " + token);
    headers.append('Content-Type', 'application/json');
    return headers;
  }
}
