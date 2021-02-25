import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { VersionsComponent } from '../../pages/versions/versions.component';

@Injectable()
export class CanDeactivateVersionsGuard implements CanDeactivate<VersionsComponent> {

    canDeactivate(
      component: VersionsComponent, currentRoute: ActivatedRouteSnapshot,
      currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot)
      : boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return true; // component.canDeactivate();
    }
}
