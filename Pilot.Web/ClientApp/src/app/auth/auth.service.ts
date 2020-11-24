import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

const TOKEN = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl: string;
  private isLoggedIn$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
    this.isLoggedIn$.next(this.getToken() != null);
  }

  login(username: string, password: string): void {
    const body = { username, password };
    const observable = this.http.post<string>(this.baseUrl + 'api/Auth/SignIn', body);
    observable.pipe(first()).subscribe(result => {
      const token = (result as any).token;
      this.setToken(token);
      this.isLoggedIn$.next(true);
    },
      err => {
        this.error$.next(err);
    });
  }

  logout() {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    });

    const observable = this.http.get<any>(this.baseUrl + 'api/Auth/SignOut', { headers: headers });
    observable.pipe(first()).subscribe(result => {
        this.error$.next(null);
        this.isLoggedIn$.next(false);
      },
      e => {
        this.error$.next(null);
        this.isLoggedIn$.next(false);
    });

    this.clearToken();
  }

  get isLoggedIn(): Observable<boolean> {
    return this.isLoggedIn$;
  }

  get error(): Observable<any> {
    return this.error$;
  }

  getToken(): string {
    const token = localStorage.getItem(TOKEN);
    if (!token) {
      return null;
    }
    return token;
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN);
  }
}
