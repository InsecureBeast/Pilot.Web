import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

import { IObject, ICommonSettings } from '../../core/data/data.classes';
import { AuthService } from '../../auth/auth.service';
import { HeadersProvider } from 'src/app/core/headers.provider';

@Injectable({ providedIn: 'root' })
export class TasksRepositoryService {
  constructor(
    private readonly http: HttpClient,
    @Inject('BASE_URL')
    private readonly baseUrl: string,
    private readonly userService: AuthService,
    private readonly headersProvider: HeadersProvider) {

  }

  getPersonalSettings(key: string): Observable<ICommonSettings> {
    const headers = this.headersProvider.getHeaders();
    return this.http.get<ICommonSettings>(this.baseUrl + 'api/Metadata/GetPersonalSettings?key=' + key, { headers: headers })
      .pipe(first());
  }

  getTasks(filter: string): Observable<IObject[]> {
    const body = JSON.stringify(filter);
    const headers = this.headersProvider.getHeaders();
    const path = this.baseUrl + 'api/Tasks/GetTasks';
    return this.http.post<IObject[]>(path, body, { headers: headers })
      .pipe(first());
  }

  getTasksWithFilter(filter: string, taskId: string): Observable<IObject[]> {
    const body = JSON.stringify({ filter, taskId });
    const headers = this.headersProvider.getHeaders();
    const path = this.baseUrl + 'api/Tasks/GetTaskWithFilter';
    return this.http.post<IObject[]>(path, body, { headers: headers })
      .pipe(first());
  }
}
