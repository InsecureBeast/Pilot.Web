import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { INode } from './node.interface';

@Injectable({ providedIn: 'root'})
export class DocumentsService {

  private documentSubject = new BehaviorSubject<INode>(null);



  document$ = this.documentSubject.asObservable();

  constructor() {

  }

  changeDocument(document: INode): void {
    this.documentSubject.next(document);
  }


  //[document] = "node"
  //  [selectedVersion] = "selectedVersion"
  //  (onClose) = "closeDocument();"
  //  (onPreviousDocument) = "previousDocument($event)"
  //  (onNextDocument) = "nextDocument($event)" > </app-document>
}
