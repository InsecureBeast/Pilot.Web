import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  AfterViewChecked,
  HostListener,
  ViewChild, TemplateRef
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, NavigationStart } from '@angular/router';

import { Subscription, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { RepositoryService } from '../../../core/repository.service';
import { ObjectNode, EmptyObjectNode } from '../../shared/object.node';
import { ChildrenType } from '../../../core/data/children.types';
import { AccessLevel, IObject } from '../../../core/data/data.classes';
import { NodeStyle, NodeStyleService } from '../../../core/node-style.service';
import { TypeIconService } from '../../../core/type-icon.service';
import { INode, IObjectNode } from '../../shared/node.interface';
import { DownloadService } from '../../../core/download.service';
import { DocumentsService } from '../../shared/documents.service';
import { RequestType } from 'src/app/core/headers.provider';
import { SystemStates } from 'src/app/core/data/system.states';
import { first } from 'rxjs/operators';
import { FilesRepositoryService } from '../../../core/files-repository.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AccessCalculator } from '../../../core/tools/access.calculator';
import { IObjectExtensions } from '../../../core/tools/iobject.extensions';

@Component({
    selector: 'app-document-list',
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.css']
})
/** documents-list component*/
export class DocumentListComponent implements OnInit, OnDestroy, AfterViewChecked {

  private routerSubscription: Subscription;
  private nodeStyleServiceSubscription: Subscription;
  private checkedNodesSubscription: Subscription;
  private objectCardChangeSubscription: Subscription;
  private ngUnsubscribe = new Subject<void>();
  private _parent: IObjectNode;

  @Input() canCheck = true;
  @Input()
  get parent(): IObjectNode {
    return this._parent;
  }
  set parent(node: IObjectNode) {
    this._parent = node;
    if (!this._parent) {
      return;
    }

    this.isLoaded = false;

    // or get item from changes
    this.cancelAllRequests(false);
    this.init(this.parent);
  }

  @Output() checked = new EventEmitter<IObjectNode[]>();
  @Output() selected = new EventEmitter<INode>();
  @Output() error = new EventEmitter<HttpErrorResponse>();
  @Output() loaded = new EventEmitter<INode>();

  @ViewChild('modalTemplate')
  private modalTemplate: TemplateRef<any>;

  modalRef: BsModalRef = null;
  nodeStyle: NodeStyle;
  nodes: IObjectNode[];
  isLoading: boolean;
  isAnyItemChecked: boolean;
  isLoaded: boolean;
  canUploadFile: boolean;
  dropZoneActivity = false;
  uploadProgressPercent: number;

  /** documents-list ctor */
  constructor(
    private repository: RepositoryService,
    private downloadService: DownloadService,
    private nodeStyleService: NodeStyleService,
    private typeIconService: TypeIconService,
    private translate: TranslateService,
    private documentsService: DocumentsService,
    private filesRepositoryService: FilesRepositoryService,
    private router: Router,
    private modalService: BsModalService,
    private accessCalculator: AccessCalculator) {

  }

  ngOnInit(): void {
    this.checkedNodesSubscription = this.documentsService.clearChecked.subscribe(v => {
      if (v) {
        this.clearChecked();
      }
    });

    this.nodeStyleServiceSubscription = this.nodeStyleService.getNodeStyle().subscribe(value => {
      this.nodeStyle = value;

      if (!this.nodes) {
        return;
      }

      for (const node of this.nodes) {
        node.loadPreview();
      }
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const startEvent = <NavigationStart>event;
        if (startEvent.navigationTrigger === 'popstate') {
          this.cancelAllRequests(false);
          this.repository.setRequestType(RequestType.FromCache);
        }
      }
    });

    this.objectCardChangeSubscription = this.documentsService.objectForCard$.subscribe(id => {
      if (!id) {
        return;
      }
      this.update(id);
    });
  }

  ngAfterViewChecked(): void {
    if (this.isLoaded) {
      this.loaded.emit(this.parent);
      this.isLoaded = false;
    }
  }

  ngOnDestroy(): void {
    if (this.nodeStyleServiceSubscription) {
      this.nodeStyleServiceSubscription.unsubscribe();
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    if (this.checkedNodesSubscription) {
      this.checkedNodesSubscription.unsubscribe();
    }

    if (this.objectCardChangeSubscription) {
      this.objectCardChangeSubscription.unsubscribe();
    }

    this.cancelAllRequests(true);
  }

  select(item: IObjectNode): void {
    if (!item.id) {
      return;
    }

    if (this.canCheck) {
      this.repository.setRequestType(RequestType.New);
      this.clearChecked();
      this.nodes = null;
      this.documentsService.changeObjectForCard(null);
    }

    this.selected.emit(item);
  }

  check(node: IObjectNode, event: MouseEvent): void {
    if (!this.canCheck) {
      return;
    }

    if (!node.id) {
      return;
    }

    if (!event.ctrlKey) {
      this.clearChecked();
    }

    node.isChecked = !node.isChecked;
    this.isAnyItemChecked = true;

    const checked = this.nodes.filter(n => n.isChecked);
    this.checked.emit(checked);
  }

  addChecked(node: IObjectNode): void {
    if (!this.canCheck) {
      return;
    }

    node.isChecked = !node.isChecked;
    this.isAnyItemChecked = true;

    const checked = this.nodes.filter(n => n.isChecked);
    this.checked.emit(checked);

    if (checked.length === 0) {
      this.isAnyItemChecked = false;
    }
  }

  async downloadDocument(node: IObjectNode) {
    await this.downloadService.downloadFile(node.source);
  }

  isEmptyNode(node: IObjectNode): boolean {
    return node instanceof EmptyObjectNode;
  }

  isStatesExists(node: IObjectNode): boolean {
    const noneStates = node.stateAttributes.filter(a => {
      const value = node.source.attributes[a.name];
      if (!value) {
        return true;
      }

      return value === SystemStates.NONE_STATE_ID;
    });

    return noneStates.length !== node.stateAttributes.length;
  }

  dropZoneState($event: boolean) {
    this.dropZoneActivity = $event;
  }

  async onFilesDropped(fileList: FileList) {
    await this.uploadHandler(fileList);
  }

  onUploadButtonClick() {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e: any) => this.uploadHandler(e.target.files);
    input.click();
  }

  async openProgressModal(): Promise<void> {
    if (this.modalRef != null) {
      return;
    }

    this.modalRef = this.modalService.show(this.modalTemplate,
      {
        backdrop: 'static'
      });

    await this.sleep(2000);
  }

  closeModal() {
    this.modalRef?.hide();
    this.modalRef = null;
  }

  private async sleep(ms): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async uploadHandler(fileList: FileList) {
    try {
      console.log('fileList', fileList);
      await this.uploadFiles(fileList);
    } catch (e) {
      this.error.emit(e);
      throw e;
    }
  }

  private async uploadFiles(fileList: FileList): Promise<void> {
    try {
      await this.openProgressModal();
      await this.filesRepositoryService.uploadFiles(this.parent.id, fileList, (p) => {
          this.uploadProgressPercent = p;
        });
      this.loadChildren(this.parent.id, this.parent.isSource, RequestType.New);
    } catch (e) {
      console.log(e);
      this.closeModal();
      throw e;
    } finally {
      this.closeModal();
    }
  }

  private update(objectId: string): void {
    if (!this.nodes) {
      return;
    }

    this.repository.getObjectAsync(objectId, RequestType.New).then(object => {
      const index = this.nodes.findIndex(n => n.id === objectId);
      const oldNode = this.nodes.find(n => n.id === objectId);
      const newNode = new ObjectNode(object, oldNode.isSource, this.typeIconService, this.ngUnsubscribe, this.translate);
      newNode.isChecked = oldNode.isChecked;
      this.nodes[index] = newNode;
    });
  }

  private init(item: IObjectNode) {
    this.nodes = null;
    this.nodes = new Array();
    for (let i = 0; i < item.children.length; i++) {
      this.nodes.push(new EmptyObjectNode());
    }
    this.isLoaded = true;
    this.loadChildren(item.id, item.isSource, RequestType.None);

    const canCreateChild = IObjectExtensions.hasAccess(this.accessCalculator.calcAccess(item.source), AccessLevel.Create);
    this.canUploadFile = item.isSource && canCreateChild;
  }

  private loadChildren(id: string, isSource: boolean, requestType: RequestType) {
    let type = ChildrenType.ListView;
    if (isSource) {
      type = ChildrenType.Storage;
    }

    this.repository.getChildrenAsync(id, type, this.ngUnsubscribe, requestType)
      .then(nodes => {
        this.isLoading = false;
        this.addNodes(nodes, isSource);
        this.checked.emit(null);

        this.documentsService.objectForCard$.pipe(first()).subscribe(objectForCardId => {
          if (!objectForCardId) {
            return;
          }
          this.update(objectForCardId);
        });
      })
      .catch(e => {
        this.error.emit(e);
        this.isLoading = false;
      });
    }

  private addNodes(documents: IObject[], isSource: boolean): void {
    this.nodes = new Array<ObjectNode>();
    for (const doc of documents) {
      if (doc.type.name === 'Root_object_type') { // todo: filter not available items
        continue;
      }

      const node = new ObjectNode(doc, isSource, this.typeIconService, this.ngUnsubscribe, this.translate);
      this.nodes.push(node);
    }
  }

  private clearChecked(): void {
    if (this.nodes) {
      for (const node of this.nodes) {
        node.isChecked = false;
      }
    }

    this.isAnyItemChecked = false;
    this.checked.emit(null);
  }

  private cancelAllRequests(isCompleted: boolean): void {
    if (this.ngUnsubscribe) {
      // This aborts all HTTP requests.
      this.ngUnsubscribe.next();
      // This completes the subject properly.
      if (isCompleted) {
        this.ngUnsubscribe.complete();
      }
    }
  }
}
