//import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
//import { RepositoryService } from '../../../services/repository.service';
//import { ChildrenType } from '../../../model/Data/children.types';
//import { IObject, IType, IChild } from '../../../model/data.classes';
//import { TypeExtensions } from '../../../tools/type.extensions';
//import { Guid } from 'src/model/Data/guid';
//import { NavigationService, INavigationItem } from '../../../services/navigation.service';
//import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
//import { HttpErrorResponse } from '@angular/common/http';
//import { Subject } from 'rxjs';

//@Component({
//    selector: 'app-tree',
//    templateUrl: './tree.component.html',
//    styleUrls: ['./tree.component.css']
//})
///** tree component*/
//export class TreeComponent implements OnInit, OnChanges, OnDestroy {
    
//  public nodes: TreeNode[];
//  public isLoading: boolean;
//  public indent: number;
  
//  @Input()
//  public expandIds: string[];
//  @Input()
//  public parent: TreeNode;

//  @Output()
//  onError = new EventEmitter<HttpErrorResponse>();

//  private ngUnsubscribe: Subject<void> = new Subject<void>();

//  /** tree ctor */
//  constructor(private repository: RepositoryService, private navigationService: NavigationService, private sanitizer: DomSanitizer) {
//    this.expandIds = new Array<string>();
//  }

//  ngOnInit() {

//  }

//  ngOnChanges(changes: SimpleChanges) {
//    this.isLoading = true;
//    this.init(this.parent, this.expandIds);
//    this.isLoading = false;
//  }

//  ngOnDestroy(): void {
//    // This aborts all HTTP requests.
//    this.ngUnsubscribe.next();
//    // This completes the subject properlly.
//    this.ngUnsubscribe.complete();
//  }

//  public toggleChild(node: TreeNode): void {
//    node.isExpanded = !node.isExpanded;
//  }

//  public selectNode(node: TreeNode): void {
//    this.navigationService.navigateTo(node);
//  }

//  public onHandleError(e: HttpErrorResponse) {
//    this.onError.emit(e);
//  }

//  private init(treeNode: TreeNode, expandIds: string[]) {

//    if (!treeNode) {
//      this.indent = 0;
//      return;
//    }

//    this.indent = treeNode.indent;

//    let type = ChildrenType.ListView;
//    if (treeNode.isSource && !treeNode.isRoot)
//      type = ChildrenType.Storage;

//    this.repository.getChildrenAsync(treeNode.id, type, this.ngUnsubscribe)
//      .then(children => this.addNodes(children, expandIds))
//      .catch(e => {
//        this.onError.emit(e);
//      });
//  }

//  private addNodes(objects: IObject[], expandIds: string[]): void {
//    this.nodes = new Array<TreeNode>();

//    for (let node of objects) {

//      if (node.type.name === "Root_object_type")
//        continue;

//      //if (node.title === "Source files")
//      //  continue;

//      if (!node)
//        continue;

//      const treeNode = new TreeNode(node, this.repository, this.navigationService, this.sanitizer);
//      if (!treeNode.isDocument) {
//        this.nodes.push(treeNode);
//        if (!expandIds)
//          continue;

//        if (expandIds.indexOf(node.id) !== -1)
//          treeNode.isExpanded = true;

//        if (expandIds.length > 0) {
//          let last: any = expandIds[expandIds.length - 1];
//          if (last === treeNode.id) {
//            treeNode.isActive = true;
//            treeNode.isExpanded = false;
//          }
//        }
//      }
//    }
//  }

//}

//export class TreeNode implements INavigationItem {

//  private _source: IObject;

//  constructor(source: IObject,
//    repository: RepositoryService,
//    navigationService: NavigationService,
//    sanitizer: DomSanitizer) {

//    this.id = source.id;
//    this.parentId = source.parentId;
//    this.children = source.children;
//    this.hasChildren = this.getHasChildren(source.children, repository);
//    this.isExpanded = false;
//    this.name = source.title;
//    this.isDocument = this.getIsDocument(source.type);
//    this.isSource = TypeExtensions.isProjectFileOrFolder(source.type);
//    this.indent = source.context.length;
//    this.isActive = false;
//    this.isRoot = Guid.isEmpty(source.id);
//    this.icon = this.getTypeIcon(source, sanitizer);
//    this._source = source;

//    //if (this.isSource && source.type.isProject) {
//    //  this.indent ++;
//    //}

//    if (this.isSource)
//      this.indent++;

//    this.subscribe(this, navigationService);
//  }

//  id: string;
//  parentId: string;
//  name: string;
//  children: IChild[];
//  hasChildren: boolean;
//  isExpanded: boolean;
//  isDocument: boolean;
//  isSource: boolean;
//  indent: number;
//  isActive: boolean;
//  isRoot: boolean;
//  icon: SafeUrl;

//  getSource(): IObject {
//    return this._source;
//  }

//  private getIsDocument(type: IType): boolean {
//    if (TypeExtensions.isProjectFile(type.name))
//      return true;

//    if (TypeExtensions.isProjectFolder(type.name))
//      return false;

//    return type.hasFiles;
//  }

//  private getHasChildren(children: IChild[], repository: RepositoryService): boolean {

//    if (!children)
//      return false;

//    for (let child of children) {
//      const childType = repository.getType(child.typeId);

//      if (!childType)
//        continue;

//      if (childType.children.length > 0)
//        return true;

//      if (TypeExtensions.isProjectFolder(childType.name))
//        return true;
//    }

//    return false;
//  }

//  private getTypeIcon(item: IObject, sanitizer: DomSanitizer): SafeUrl {
//    var icon = item.type.icon;
//    if (icon === null)
//      return null;

//    var imageSrc = 'data:image/svg+xml;charset=utf-8;base64,' + icon;
//    var source = sanitizer.bypassSecurityTrustUrl(imageSrc);
//    return source;
//  }

//  private subscribe(node: TreeNode, navigationService: NavigationService) {

//    navigationService.currentObject.subscribe(item => {
//      if (!item || !node.id)
//        return;

//      var source = item.getSource();
//      if (source.type.hasFiles)
//        return;

//      node.isActive = item.id === node.id && node.isSource === item.isSource;
//      if (node.isActive)
//        return;

//      if (node.id === item.parentId && node.hasChildren && node.isSource === item.isSource) {
//        node.isExpanded = true;
//      }
//    });
//  }
//}
