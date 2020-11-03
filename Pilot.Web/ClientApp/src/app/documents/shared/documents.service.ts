import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root'})
export class DocumentsService {

  private objectForCardSubject = new BehaviorSubject<string>(null);
  private clearCheckedSubject = new BehaviorSubject<boolean>(false);

  objectForCard$ = this.objectForCardSubject.asObservable();
  clearChecked = this.clearCheckedSubject.asObservable();

  constructor() {
  }

  changeObjectForCard(objectId: string): void {
    this.objectForCardSubject.next(objectId);
  }

  changeClearChecked(value: boolean): void {
    this.clearCheckedSubject.next(value);
  }
}
