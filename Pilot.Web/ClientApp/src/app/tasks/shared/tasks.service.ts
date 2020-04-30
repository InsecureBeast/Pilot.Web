import { Injectable, ElementRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import {TaskNode } from './task.node';


@Injectable({ providedIn: 'root' })
export class TasksService {

  private clearCheckedSubject = new BehaviorSubject<boolean>(false);
  //private readonly scrollPositions: KeyedCollection<number>;

  clearChecked = this.clearCheckedSubject.asObservable();

  constructor() {
  }

  changeClearChecked(value: boolean): void {
    this.clearCheckedSubject.next(value);
  }

  //restoreScrollPosition(node: TaskNode): void {
  //  const pos = this.getPosition(node.id);
  //  window.scrollTo(0, pos);
  //}

  //saveScrollPosition(node: TaskNode): void {
  //  const pos = window.pageYOffset;
  //  this.savePosition(node.source.id, pos);
  //}

  //private savePosition(key: string, pos: number): void {
  //  this.scrollPositions.add(key, pos);
  //}

  //private getPosition(key: string): number {
  //  if (this.scrollPositions.containsKey(key)) {
  //    const value = this.scrollPositions.remove(key);
  //    return value;
  //  }

  //  return 0;
  //}
}
