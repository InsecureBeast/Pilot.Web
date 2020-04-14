import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { INode } from './node.interface';

@Injectable({ providedIn: 'root'})
export class DocumentsService {

  private documentSubject = new BehaviorSubject<INode>(null);
  private clearCheckedSubject = new BehaviorSubject<boolean>(false);

  document$ = this.documentSubject.asObservable();
  clearChecked = this.clearCheckedSubject.asObservable();

  constructor() {

  }

  changeDocument(document: INode): void {
    this.documentSubject.next(document);
  }

  changeClearChecked(value: boolean): void {
    this.clearCheckedSubject.next(value);
  }}
