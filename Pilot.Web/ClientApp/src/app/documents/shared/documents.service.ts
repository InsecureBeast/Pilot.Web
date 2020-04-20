import { Injectable, ElementRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { INode } from './node.interface';
import { ObjectNode } from './object.node';

@Injectable({ providedIn: 'root'})
export class DocumentsService {

  private documentSubject = new BehaviorSubject<INode>(null);
  private clearCheckedSubject = new BehaviorSubject<boolean>(false);
  private readonly scrollPositions: KeyedCollection<number>;
  private readonly cacheNodes: KeyedCollection<ObjectNode[]>;

  document$ = this.documentSubject.asObservable();
  clearChecked = this.clearCheckedSubject.asObservable();

  constructor() {
    this.scrollPositions = new KeyedCollection<number>();
    this.cacheNodes = new KeyedCollection<ObjectNode[]>();
  }

  changeDocument(document: INode): void {
    this.documentSubject.next(document);
  }

  changeClearChecked(value: boolean): void {
    this.clearCheckedSubject.next(value);
  }

  restoreScrollPosition(node : INode, element: ElementRef): void {
    const pos = this.getPosition(node.id);
    element.nativeElement.scrollTop = pos;
  }

  saveScrollPosition(node: INode, element: ElementRef): void {
    const pos = element.nativeElement.scrollTop;
    this.savePosition(node.source.parentId, pos);
  }

  saveNodes(key: string, nodes: ObjectNode[]): void {
    if (this.cacheNodes.containsKey(key))
      this.cacheNodes.remove(key);

    this.cacheNodes.add(key, nodes);
  }

  getNodes(key: string): ObjectNode[] {
    if (this.cacheNodes.containsKey(key))
      return this.cacheNodes.remove(key);

    return null;
  }

  private savePosition(key: string, pos: number): void {
    this.scrollPositions.add(key, pos);
  }

  private getPosition(key: string): number {
    if (this.scrollPositions.containsKey(key)) {
      const value = this.scrollPositions.item(key);
      //this.scrollPositions.remove(key);
      return value;
    }

    return 0;
  }
}

export interface IKeyedCollection<T> {
  add(key: string, value: T);
  containsKey(key: string): boolean;
  count(): number;
  item(key: string): T;
  keys(): string[];
  remove(key: string): T;
  values(): T[];
}

export class KeyedCollection<T> implements IKeyedCollection<T> {
  private items: { [index: string]: T } = {};

  private length: number = 0;

  containsKey(key: string): boolean {
    return this.items.hasOwnProperty(key);
  }

  count(): number {
    return this.length;
  }

  add(key: string, value: T) {
    if (!this.items.hasOwnProperty(key))
      this.length++;

    this.items[key] = value;
  }

  remove(key: string): T {
    var val = this.items[key];
    delete this.items[key];
    this.length--;
    return val;
  }

  item(key: string): T {
    return this.items[key];
  }

  keys(): string[] {
    var keySet: string[] = [];

    for (var prop in this.items) {
      if (this.items.hasOwnProperty(prop)) {
        keySet.push(prop);
      }
    }

    return keySet;
  }

  values(): T[] {
    var values: T[] = [];

    for (var prop in this.items) {
      if (this.items.hasOwnProperty(prop)) {
        values.push(this.items[prop]);
      }
    }

    return values;
  }
}
