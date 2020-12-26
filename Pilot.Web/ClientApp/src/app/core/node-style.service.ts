import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NodeStyleService {

  private nodeStyleSource = new BehaviorSubject<NodeStyle>(NodeStyle.ListView);
  private current: NodeStyle;

  constructor() {

    const nodeStyle = this.loadNodeStyle();
    this.current = nodeStyle;
    this.setNodeStyle(nodeStyle);
  }

  get currentNodeStyle(): NodeStyle {
    return this.current;
  }

  setNodeStyle(style: NodeStyle): void {
    localStorage.setItem('nodeStyle', style.toString());
    this.current = style;
    this.nodeStyleSource.next(style);
  }

  getNodeStyle(): Observable<NodeStyle> {
    return this.nodeStyleSource.asObservable();
  }

  private loadNodeStyle(): NodeStyle {
    const nodeStyle = localStorage.getItem('nodeStyle');

    if (nodeStyle === '0') {
      return NodeStyle.ListView;
    }

    if (nodeStyle === '1') {
      return NodeStyle.GridView;
    }

    return NodeStyle.ListView;
  }
}

export enum NodeStyle {
  ListView = 0,
  GridView = 1
}
