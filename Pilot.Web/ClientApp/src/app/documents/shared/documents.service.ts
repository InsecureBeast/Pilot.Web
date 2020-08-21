import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { IObject } from 'src/app/core/data/data.classes';

@Injectable({ providedIn: 'root'})
export class DocumentsService {

  private documentSubject = new BehaviorSubject<IObject>(null);
  private clearCheckedSubject = new BehaviorSubject<boolean>(false);

  document$ = this.documentSubject.asObservable();
  clearChecked = this.clearCheckedSubject.asObservable();

  constructor() {
  }

  changeDocument(document: IObject): void {
    this.documentSubject.next(document);
  }

  changeClearChecked(value: boolean): void {
    this.clearCheckedSubject.next(value);
  }
}
