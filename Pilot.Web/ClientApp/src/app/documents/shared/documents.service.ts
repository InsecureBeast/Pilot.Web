import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';

@Injectable({ providedIn: 'root'})
export class DocumentsService {

  private objectForCardSubject = new BehaviorSubject<string>(null);
  private clearCheckedSubject = new BehaviorSubject<boolean>(false);

  objectForCard$ = this.objectForCardSubject.asObservable();
  clearChecked = this.clearCheckedSubject.asObservable();

  constructor(router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const startEvent = <NavigationStart>event;
        if (startEvent.navigationTrigger === 'popstate') {
          this.changeClearChecked(true);
        }
      }
    });
  }

  changeObjectForCard(objectId: string): void {
    this.objectForCardSubject.next(objectId);
  }

  changeClearChecked(value: boolean): void {
    this.clearCheckedSubject.next(value);
  }
}
