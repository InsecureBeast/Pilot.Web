import { IObject } from '../../../core/data/data.classes';
import { TypeExtensions } from '../../../core/tools/type.extensions';
import { INode } from '../../shared/node.interface';
import { SystemIds } from '../../../core/data/system.ids';

export class BreadcrumbNode implements INode {
  id: string;
  parentId: string;
  title: string;
  isActive: boolean;
  isSource: boolean;
  isDocument: boolean;
  isChecked: boolean;
  isRoot: boolean;
  isSearchItem = false;
  width: number;

  /** BreadcrumbNode ctor */
  constructor(public source: IObject, isActive: boolean) {
    this.update(source);
    this.isActive = isActive;
  }

  update(source: IObject): void {
    this.source = source;
    this.id = source.id;
    this.title = source.title;
    this.isDocument = false;
    this.parentId = source.parentId;
    this.isSource = TypeExtensions.isProjectFileOrFolder(source.type);
    this.source = source;
    this.isRoot = source.id === SystemIds.rootId;
  }

  setWidth(offsetWidth: any) {
    this.width = offsetWidth;
  }
}

export class SearchResultsBreadcrumbNode extends BreadcrumbNode {

  isSearchItem = true;
  isRoot = false;
  isActive = true;

  constructor() {
    super(null, true);
  }

  update(source: IObject): void {
  }
}