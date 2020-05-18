import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) {

  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isLoggedIn 
      .pipe(take(1), map((isLoggedIn: boolean) => { 
          if (!isLoggedIn) {
            // not logged in so redirect to login page with the return url
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            return false;
          }
          return true;
        }));
  }

  //canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

  //  var isSignedIn = this.authService.isSignedIn();
  //  if (isSignedIn) {// && !this.jwtHelper.isTokenExpired(token)) {
  //    return true;
  //  }

  //  this.router.navigate(["login"]);
  //  return false;
  //}
}
