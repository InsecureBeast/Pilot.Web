import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, ParamMap, NavigationStart } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Subscription, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { SystemIds } from '../../../core/data/system.ids';
import { RepositoryService } from '../../../core/repository.service';
import { ObjectNode } from '../../shared/object.node';
import { TypeIconService } from '../../../core/type-icon.service';
import { INode } from '../../shared/node.interface';
import { ModalService } from '../../../ui/modal/modal.service';

@Component({
    selector: 'app-documents',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.css']
})
/** documents component*/
export class DocumentsComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject<void>();
  private navigationSubscription: Subscription;
  private routerSubscription: Subscription;

  documents = new Array<INode>();
  currentItem: ObjectNode;
  isDocument: boolean;
  isLoading: boolean;
  error: HttpErrorResponse;
  node: INode;
  
  /** documents ctor */
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly repository: RepositoryService,
    private readonly typeIconService: TypeIconService,
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly modalService: ModalService,
    private readonly location: Location) {

  }

  ngOnInit(): void {

    this.navigationSubscription = this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      let id = params.get('id');
      if (!id)
        id = SystemIds.rootId;

      let isSource = false;
      if (this.activatedRoute.snapshot.url.length !== 0) {
        const urlSegment = this.activatedRoute.snapshot.url[0].path;
        if (urlSegment === 'files')
          isSource = true;
      }

      this.repository.getObjectAsync(id)
        .then(source => {
          this.currentItem = new ObjectNode(source, isSource, this.typeIconService, this.ngUnsubscribe, this.translate);
          //this.navigationService.initialize(current);
          this.isLoading = false;
        })
        .catch(err => {
          this.error = err;
          this.isLoading = false;
          //this.toolbarService.clearToolbar();
        });
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      // close your modal here
      if (event instanceof NavigationStart) {
        const startEvent = <NavigationStart>event;
        if (startEvent.navigationTrigger === 'popstate') {
          this.modalService.close("document-modal");
        }
      }

    });
  }

  ngOnDestroy(): void {
    //this.navigationServiceSubscription.unsubscribe();
    //this.closeDocumentSubscription.unsubscribe();
    //this.nodeStyleSubscription.unsubscribe();
    this.navigationSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();

    // cancel
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onItemSelected(node: INode): void {
    this.isDocument = node.isDocument;
    this.node = node;

    if (node.isDocument) {
      //this.router.navigate([{ outlets: { document: 'document/' + node.id } }]);
      //this.router.navigateByUrl('/document/' + node.id);
      this.router.navigate(['./d/' + node.id], { relativeTo: this.activatedRoute });
      this.modalService.open("document-modal");
      return;
    }

    if (node.isSource)
      this.router.navigateByUrl('/files/' + node.id);
    else
      this.router.navigateByUrl('/documents/' + node.id);
  }

  closeDocument() {
    this.modalService.close("document-modal");
    this.location.replaceState('/documents/' + this.currentItem.id);
    this.location.back();
  }

  previousDocument($event) {
    const indexOf = this.documents.findIndex(id => id === $event);
    if (!this.canPreviousDocument(indexOf))
      return;

    const prev = this.documents[indexOf - 1];
    this.isDocument = prev.isDocument;
    this.node = prev;
    this.location.replaceState('./d/' + prev.id);
  }

  nextDocument($event) {
    const indexOf = this.documents.findIndex(id => id === $event);
    if (!this.canNextDocument(indexOf))
      return;

    const next = this.documents[indexOf + 1];
    this.isDocument = next.isDocument;
    this.node = next;
    this.location.replaceState('./d/' + next.id);
  }

  private canNextDocument(indexOf: number): boolean {
    if (indexOf === -1)
      return false;

    if (indexOf === this.documents.length - 1)
      return false;

    return true;
  }

  private canPreviousDocument(indexOf: number): boolean {
    if (indexOf === -1)
      return false;

    if (indexOf === 0)
      return false;

    return true;
  }
}
