import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.css', '../../shared/toolbar.css']
})
export class ContextMenuComponent implements OnInit {


  items: MenuItem[];

  constructor() {
    this.items = new Array<MenuItem>();
  }

  ngOnInit(): void {
  }

  addMenuItem(item: MenuItem): void {
    this.items.push(item);
  }

  clear(): void {
    this.items = new Array<MenuItem>();
  }

  execute(item: MenuItem): void {
    if (item && item.canExecute) {
      item.execute();
    }
  }
}

export class MenuItem {
  icon: string;
  title: string;
  execute: () => void;
  canExecute: () => boolean;

  constructor() {
    this.canExecute = () => true;
  }

  static createItem(title: string): MenuItem {
    const item = new MenuItem();
    item.title = title;
    return item;
  }

  withIcon(icon: string): MenuItem {
    this.icon = icon;
    return this;
  }

  withAction(action: () => void) {
    this.execute = action;
    return this;
  }

  withCanExecute(canExecute: () => boolean) {
    this.canExecute = canExecute;
    return this;
  }
}
