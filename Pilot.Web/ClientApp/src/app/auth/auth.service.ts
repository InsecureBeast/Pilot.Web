import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { Headers } from '@angular/http';

const TOKEN = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly baseUrl: string;
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  login(username: string, password: string): Observable<string> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('username', username);
    headers.append('password', password);

    const observable = this.http.get<string>(this.baseUrl + 'api/Auth/SignIn', { headers: headers.toJSON() });
    observable.pipe(first()).subscribe(result => {
      const token = (result as any).token;
      this.setToken(token);
      this.loggedIn.next(true);
    });

    return observable;
  }

  logout() {
    let token = this.getToken();
    let headers = new Headers();
    headers.append('Authorization', "Bearer " + token);
    headers.append('Content-Type', 'application/json');
    this.http.get(this.baseUrl + 'api/Auth/SignOut', { headers: headers.toJSON() });
    this.clearToken();
    this.loggedIn.next(false);
  }

  isSignedIn(): boolean {
    return this.getToken() != null;
  }

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getToken(): string {
    return localStorage.getItem(TOKEN);
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN, token);
  }

  private clearToken(): void {
    localStorage.removeItem(TOKEN);
  }
}
