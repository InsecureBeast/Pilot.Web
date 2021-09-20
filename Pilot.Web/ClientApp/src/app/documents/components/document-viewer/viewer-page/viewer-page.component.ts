import { AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { FilesRepositoryService } from 'src/app/core/files-repository.service';
import { RemarksService } from 'src/app/documents/shared/remarks.service';
import { Remark, Point, RemarkType } from '../../remarks/remark';

export class DisplayRemark {
  remark: Remark;
  position: Point;
  popupLeft: number;
  boundRect: DOMRect;

  constructor() {
    this.boundRect = new DOMRect();
  }
}

class RedPencilRemarkDisplayParams {
  viewBoxValue = '0 0 1 1';
  viewBoxHeight = 1;
  viewBoxWidth = 1;
  transform = 'scale(1)';
}

@Component({
  selector: 'app-viewer-page',
  templateUrl: './viewer-page.component.html',
  styleUrls: ['./viewer-page.component.css']
})
export class ViewerPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private _xRatio: number;
  private _yRatio: number;
  private _selectedRemark: Remark;
  private remarkVisibilitySubscription: Subscription;
  private selectedRemarksSubscription: Subscription;
  private remarksSubscription: Subscription;
  private _remarksVisible: boolean;
  private imageHtmlRef: HTMLImageElement;
  private _displacementFactor = 1;
  private _remarks: Remark[];

  displayRemarks: DisplayRemark[];
  image: SafeUrl;
  redParams: RedPencilRemarkDisplayParams;
      
  @Input() 
  set selectedRemark(value: Remark) {
    if (value && value.pageNumber !== this.pageNumber) {
      return;
    }

    this._selectedRemark = value;
  }
  get selectedRemark(): Remark {
    return this._selectedRemark;
  }

  @Input() page: string;
  @Input() pageNumber: number;

  @ViewChild('container') public container: ElementRef;

  constructor(
    private readonly remarksService: RemarksService, 
    private readonly sanitizer: DomSanitizer,
    filesRepositoryService: FilesRepositoryService) { 
    
    this._displacementFactor = filesRepositoryService.displacementFactor;
    this.redParams = new RedPencilRemarkDisplayParams();
    this.remarkVisibilitySubscription = this.remarksService.remarksVisibility.subscribe(v => {
      this._remarksVisible = v;
      this.drawRemarks();
    });
    
    this.selectedRemarksSubscription = this.remarksService.selectedRemark.subscribe(selected => {
      if (!selected) {
        return;
      }
      
      this.openPopup(selected);
    });
  }

  ngOnDestroy(): void {
    this.remarksSubscription?.unsubscribe();
    this.remarkVisibilitySubscription?.unsubscribe();
    this.selectedRemarksSubscription?.unsubscribe();
  }
  
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.image = this.sanitizer.bypassSecurityTrustUrl(this.page);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.drawRemarks();
  }

  annotationPopupOpen(remark: Remark, $event: Event): void {
    $event.preventDefault();
    $event.stopPropagation();

    this.openPopup(remark);
  }

  isPencil(remark: DisplayRemark): boolean {
    return RemarkType.isRedPensil(remark.remark.type);
  }

  imageLoaded(img: HTMLImageElement) : void {
    this.imageHtmlRef = img;
    this.remarksSubscription = this.remarksService.remarks.subscribe(remarks => {
      this._remarks = new Array();
      for (const r of remarks) {
        if (this.pageNumber === r.pageNumber)
          this._remarks.push(r);
      }
      this.drawRemarks();
    })
  }

  @HostListener('document:click', ['$event']) 
  clickedOutside($event): void {
    this.closePopups();
  }

  private closePopups(): void {
    if (this._remarks) {
      this._remarks.forEach(r => {
        r.isOpen = false;
      });
    }
  }

  private openPopup(remark: Remark): void {
    this.closePopups();
    remark.isOpen = true;
  }

  private calcRemarkPopupLeft(remark: DisplayRemark): number {
    var containerEl = this.container.nativeElement;
    const width = containerEl.offsetWidth;
    const marginLeft = 15;
    //width of remark. See css div.annotation-view class
    const positionWithWidth = remark.position.left + 250 + marginLeft; 
    const diff = width - positionWithWidth;
    if (diff < 0) {
      return diff;
    }

    return 0;
  }

  private setupRedPencilDisplayParams(newWidth: number, newHeight: number) {
    this.redParams.viewBoxWidth = newWidth;
    this.redParams.viewBoxHeight = newHeight;
    this.redParams.viewBoxValue = `${0} ${0} ${newWidth} ${newHeight}`;
    this.redParams.transform = `scale(${(1 / this._xRatio) * this._displacementFactor})`;
  }

  private drawRemarks(): void {
    if (!this._remarks || this._remarks.length === 0) {
      return;
    }

    this.displayRemarks = new Array();
    if (!this.imageHtmlRef || !this._remarksVisible) {
      return;
    }

    const img = this.imageHtmlRef;
    this._xRatio = img.naturalWidth / img.offsetWidth;
    this._yRatio = img.naturalHeight / img.offsetHeight;
    this.setupRedPencilDisplayParams(img.offsetWidth, img.offsetHeight);
    
    const sortedRemarks = [...this._remarks].sort((a, b) => (a.position.top > b.position.top ? -1 : 1));
    for (const remark of sortedRemarks) {
      
      if (!remark.position) {
        continue;
      }
              
      const displayRemark = new DisplayRemark();
      displayRemark.remark = remark;
      const  x = (remark.position.left / this._xRatio ) * this._displacementFactor;
      const  y = (remark.position.top / this._yRatio ) * this._displacementFactor;
      displayRemark.position = new Point(x, y);
      displayRemark.popupLeft = this.calcRemarkPopupLeft(displayRemark);
      this.displayRemarks.push(displayRemark);
    }
  }
}