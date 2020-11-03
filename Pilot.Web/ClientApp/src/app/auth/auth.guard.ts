import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

import { Observable, ReplaySubject } from 'rxjs';
import { map, skipWhile } from 'rxjs/operators';
import { RepositoryService } from '../core/repository.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService, private repository: RepositoryService) {
    
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const canActivate$ = new ReplaySubject<boolean>();
    const can = this.repository.initialize().pipe(skipWhile(v => !v), map((isInit: boolean) => { 
        if (!this.authService.getToken()) {
          // not logged in so redirect to login page with the return url
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          canActivate$.next(false);
          return false;
        }

        return true;
      })).subscribe(init => {
        canActivate$.next(init);
      }, err => {
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        canActivate$.next(false);
      });

      return canActivate$;
  }
}
