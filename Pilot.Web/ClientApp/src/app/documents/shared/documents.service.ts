import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { IObject } from 'src/app/core/data/data.classes';

@Injectable({ providedIn: 'root'})
export class DocumentsService {

  private documentForCardSubject = new BehaviorSubject<IObject>(null);
  private clearCheckedSubject = new BehaviorSubject<boolean>(false);

  documentForCard$ = this.documentForCardSubject.asObservable();
  clearChecked = this.clearCheckedSubject.asObservable();

  constructor() {
  }

  changeDocumentForCard(document: IObject): void {
    this.documentForCardSubject.next(document);
  }

  changeClearChecked(value: boolean): void {
    this.clearCheckedSubject.next(value);
  }
}
