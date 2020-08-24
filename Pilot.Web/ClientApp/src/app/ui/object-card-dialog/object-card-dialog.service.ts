import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root'})
export class ObjectCardDialogService {

  private documentForCardSubject = new BehaviorSubject<string>(null);
  documentForCard$ = this.documentForCardSubject.asObservable();

  constructor() {
  }

  changeDocumentForCard(documentId: string): void {
    this.documentForCardSubject.next(documentId);
  }
}
