import { Injectable } from '@angular/core';
import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

@Injectable({providedIn: 'root'})
export class RouteReuseService implements  RouteReuseStrategy {

  private handlers: { [key: string]: DetachedRouteHandle } = {};

  constructor() {
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (!route.routeConfig || route.routeConfig.loadChildren) {
      return false;
    }

    let shouldReuse = false;
    //console.log('checking if this route should be re used or not', route);
    if (route.routeConfig.data) {
      route.routeConfig.data.reuse ? shouldReuse = true : shouldReuse = false;
    }
    return shouldReuse;
  }

  store(route: ActivatedRouteSnapshot, handle: {}): void {
    //console.log('storing handler');
    if (handle) {
      this.handlers[this.getUrl(route)] = handle;
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    //console.log('checking if it should be re attached');
    //return true;
    const should = !!this.handlers[this.getUrl(route)];
    return should;
  }

  retrieve(route: ActivatedRouteSnapshot): {} {
    if(!route.routeConfig || route.routeConfig.loadChildren) {
      return null;
    };

    //console.log('Attach cached page for: ', route.data['key']);
    //return this.handlers[route.data['key']];
    return this.handlers[this.getUrl(route)];
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    let reUseUrl = false;
    if (future.routeConfig) {
      if (future.routeConfig.data) {
        reUseUrl = future.routeConfig.data.reuse;
      }
    }
    const defaultReuse = (future.routeConfig === current.routeConfig);
    const should = reUseUrl || defaultReuse;
    return should;
  }

  private getUrl(route: ActivatedRouteSnapshot): string {
    if (route.routeConfig) {
      const url = route.routeConfig.path;
      //console.log('returning url', url);
      return url;
    }

    return '';
  }

}

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
     return false;
  }
  store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void { }
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
     return false;
  }
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
     return null;
  }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return (future.routeConfig === curr.routeConfig) || future.data.reuse;
  }
}
