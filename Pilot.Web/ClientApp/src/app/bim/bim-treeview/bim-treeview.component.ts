import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { TreeviewConfig, TreeviewItem } from 'ngx-treeview';
import { IIfcNode } from '../shared/bim-data.classes';
import { SystemIds } from 'src/app/core/data/system.ids';

@Component({
  selector: 'app-bim-treeview',
  templateUrl: './bim-treeview.component.html',
  styleUrls: ['./bim-treeview.component.css']
})
export class BimTreeviewComponent implements OnInit {

  private selectedNode: TreeviewItem;

  // dropdownEnabled = true;
  items: TreeviewItem[];
  values: number[];
  config = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: true,
    hasCollapseExpand: true,
    decoupleChildFromParent: false,
    maxHeight: this.calcHeight()
  });

  @Input()
  set ifcNodes(nodes: IIfcNode[]) {
    this.loadNodes(nodes);
  }

  @Output()
  selected = new EventEmitter<IIfcNode>();

  constructor() {
    this.items = new Array<TreeviewItem>();
  }

  ngOnInit(): void {

  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.config.maxHeight = this.calcHeight();
  }

  private calcHeight(): number {
    // TODO
    return window.innerHeight / 2 - 120;
  }

  private loadNodes(nodes: IIfcNode[]): void {
    if (!nodes) {
      return;
    }

    // const parentsMap = nodes.map(x => [x.parentGuid, x] as [string, IIfcNode]);
    const root = nodes.find(n => n.parentGuid === SystemIds.emptyId);
    const rootItem = this.createTreeviewItem(root);
    this.traverseNodes(rootItem, nodes);
    this.items.push(rootItem);
  }

  private traverseNodes(nodeItem: TreeviewItem, nodes: IIfcNode[]): void {
    const children = nodes.filter(n => n.parentGuid === nodeItem.value.guid);
    if (children.length === 0) {
      return;
    }

    const childrenItems = new Array<TreeviewItem>();
    children.forEach(n => {
      const item = this.createTreeviewItem(n);
      childrenItems.push(item);
      this.traverseNodes(item, nodes);
    });

    nodeItem.children = childrenItems;
  }

  private createTreeviewItem(n: IIfcNode) {
    return new TreeviewItem({
      text: n.name,
      value: n,
      collapsed: true,
      checked: false,
      children: new Array<TreeviewItem>(),
    });
  }

  onSelectedChange($event): void {
    console.log('onSelectedChange');
  }

  onFilterChange($event): void {
    console.log('onFilterChange');
  }

  select(item: TreeviewItem): void {
    if (this.selectedNode) {
      this.selectedNode.checked = false;
    }

    item.checked = true;
    this.selectedNode = item;

    this.selected.emit(item.value);
  }
}
