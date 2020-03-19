import { Component, Output, Input, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { SafeUrl, Title } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, NavigationStart } from '@angular/router';

import { Subscription, Subject } from 'rxjs';

import { INode } from '../../shared/node.interface';
import { FilesSelector } from '../../../core/tools/files.selector';
import { SourceFileService } from '../../../core/source-file.service';
import { Constants } from '../../../core/constants';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
/** document component*/
export class DocumentComponent implements OnInit, OnDestroy, OnChanges {

  //private routeSubscription: Subscription;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() onError = new EventEmitter<HttpErrorResponse>();

  @Input() document: INode;

  images: SafeUrl[];
  isLoading: boolean;

  /** document-details ctor */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly sourceFileService: SourceFileService) {

  }

  ngOnInit(): void {
    //this.routeSubscription = this.route.paramMap.subscribe((params: ParamMap) => {

    //});
    //this.navigationServiceSubscription = this.navigationService.currentObject.subscribe(document => {
    //  this._document = document;
    //  this.init(document);
    //});
  }

  ngOnDestroy(): void {
    //this.routeSubscription.unsubscribe();
    this.ngUnsubscribe.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.document)
      return;

    const source = this.document.source;
    this.images = null;

    if (this.sourceFileService.isXpsFile(source)) {
      this.isLoading = true;
      const file = FilesSelector.getSourceFile(source.actualFileSnapshot.files);
      this.images = new Array<SafeUrl>();
      this.sourceFileService.showXpsDocumentAsync(file, Constants.defaultDocumentScale, this.ngUnsubscribe, this.images)
        .then(_ => this.isLoading = false)
        .catch(e => {
          this.isLoading = false;
          this.onError.emit(e);
        });
      return;
    }
  }

  close($event) {
    this.onClose.emit($event);
  }
}
