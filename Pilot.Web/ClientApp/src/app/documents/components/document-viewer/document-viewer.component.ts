import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, Output, EventEmitter, HostListener, ChangeDetectorRef, Directive, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Constants } from 'src/app/core/constants';
import { IFileSnapshot } from 'src/app/core/data/data.classes';
import { SourceFileService } from 'src/app/core/source-file.service';
import { FilesSelector } from 'src/app/core/tools/files.selector';
import { RemarksService } from '../../shared/remarks.service';
import { Point, Remark } from '../remarks/remark';
import { RemarksScrollPositionService } from './scroll.service';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css']
})
export class DocumentViewerComponent implements OnInit, OnDestroy {
  
  private ngUnsubscribe = new Subject<void>();
  private remarksSubscription: Subscription;
  private selectedRemarksSubscription: Subscription;
  private scrollSubscription: Subscription;

  images: string[];
  remarks: Remark[];
  isLoading: boolean;
  error: HttpErrorResponse; //TODO event
  position: Point;
  
  
  @Input()
  set snapshot(value: IFileSnapshot) {
    if (value) {
      this.loadSnapshot(value);
    }
  }

  @Output() downloaded = new EventEmitter<any>();

  @ViewChild("viewer") viewer : ElementRef;

  constructor(
    private readonly sourceFileService: SourceFileService, 
    private changeDetectorRef: ChangeDetectorRef,
    private readonly remarksService: RemarksService, 
    private readonly remarksScrollService: RemarksScrollPositionService) {

    this.images = new Array();
    this.remarks = new Array();
    this.position = new Point(0,0);

    this.remarksSubscription = this.remarksService.remarks.subscribe(remarks => {
      this.remarks = remarks;
    });

    this.scrollSubscription = this.remarksScrollService.position.subscribe(position => {
      if (this.viewer){
        this.viewer.nativeElement.scrollTop = position - 200;
      }
    })
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }

    this.remarksSubscription?.unsubscribe();
    this.selectedRemarksSubscription?.unsubscribe();
    this.scrollSubscription?.unsubscribe();
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
    return new Point(position.left, position.top);
  }

  private loadSnapshot(snapshot: IFileSnapshot): void {
    this.isLoading = true;
    this.images = new Array<string>();

    if (this.sourceFileService.isXpsFile(snapshot)) {
      const file = FilesSelector.getSourceFile(snapshot.files);
      this.sourceFileService.fillUnsafeXpsDocumentPagesAsync(file, Constants.defaultDocumentScale, this.ngUnsubscribe, this.images)
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

      this.sourceFileService.getUnsafeImageFileToShowAsync(file, this.ngUnsubscribe)
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
