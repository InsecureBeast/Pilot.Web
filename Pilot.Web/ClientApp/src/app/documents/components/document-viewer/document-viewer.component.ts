import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnDestroy, OnInit, Output, EventEmitter, HostListener, ChangeDetectorRef } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Subject, Subscription } from 'rxjs';
import { Constants } from 'src/app/core/constants';
import { IFileSnapshot, IObject } from 'src/app/core/data/data.classes';
import { SourceFileService } from 'src/app/core/source-file.service';
import { FilesSelector } from 'src/app/core/tools/files.selector';
import { RemarksService } from '../../shared/remarks.service';
import { Point, Remark } from '../remarks/remark';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css']
})
export class DocumentViewerComponent implements OnInit, OnDestroy {
  
  private ngUnsubscribe = new Subject<void>();
  private remarksSubscription: Subscription;

  images: SafeUrl[];
  remarks: Remark[];
  isLoading: boolean;
  error: HttpErrorResponse; //TODO event
  position: Point;
  
  
  @Input()
  set snapshot(value: IFileSnapshot) {
    if (value)
      this.loadSnapshot(value);
  }

  @Output() downloaded = new EventEmitter<any>();

  constructor(
    private readonly sourceFileService: SourceFileService, 
    private changeDetectorRef: ChangeDetectorRef,
    private readonly remarksService: RemarksService) {

    this.images = new Array();
    this.remarks = new Array();
    this.position = new Point(0,0);

    this.remarksSubscription = this.remarksService.remarks.subscribe(remarks => {
      this.remarks = remarks;
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }

    if (this.remarksSubscription){
      this.remarksSubscription.unsubscribe();
    }
  }

  download($event): void {
    this.downloaded.emit($event);
  }

  @HostListener('window:resize')
  onResize() {
    this.changeDetectorRef.detectChanges();
  }

  calcRemarkPosition(position: Point, image: HTMLElement): Point {
    console.log(`${image.offsetWidth}  ${image.clientWidth}  ${image.scrollWidth}`);
    console.log(`${position.top}  ${position.left}`);
    return new Point(position.top, position.left);
  }

  private loadSnapshot(snapshot: IFileSnapshot): void {
    this.isLoading = true;
    this.images = new Array<SafeUrl>();

    if (this.sourceFileService.isXpsFile(snapshot)) {
      const file = FilesSelector.getSourceFile(snapshot.files);
      this.sourceFileService.fillXpsDocumentPagesAsync(file, Constants.defaultDocumentScale, this.ngUnsubscribe, this.images)
        .then(_ => this.isLoading = false)
        .catch(e => {
          this.isLoading = false;
          this.images = null;
          this.error = e;
        });
      return;
    }

    if (this.sourceFileService.isImageFile(snapshot)) {
      const file = FilesSelector.getSourceFile(snapshot.files);
      if (!file) {
        this.isLoading = false;
        this.images = null;
        return;
      }

      this.sourceFileService.getImageFileToShowAsync(file, this.ngUnsubscribe)
        .then(url => {
          this.images.push(url);
          this.isLoading = false;
        })
        .catch(e => {
          this.images = null;
          this.error = e;
        });

      return;
    }

    if (this.sourceFileService.isKnownFile(snapshot)) {
      this.sourceFileService.openFileAsync(snapshot, this.ngUnsubscribe)
        .then(() => {
          this.isLoading = false;
        })
        .catch(e => {
          this.images = null;
          this.error = e;
        });
      return;
    }

    this.images = null;
    this.isLoading = false;
  }
}
