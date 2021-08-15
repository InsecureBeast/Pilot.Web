import { AfterViewInit, Directive, HostListener, OnDestroy } from '@angular/core';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { RemarksService } from 'src/app/documents/shared/remarks.service';
import { Remark, Point, RemarkType } from '../../remarks/remark';
import { RemarksScrollPositionService } from '../scroll.service';

class DisplayRemark {
  private element: ElementRef;

  remark: Remark;
  position: Point;
  popupLeft: number;
  scrollTop: number;

  setElement(element: ElementRef): void {
    this.element = element;
    let datas = element.nativeElement.getBoundingClientRect();
    this.scrollTop = datas.top;
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
  private remarksSubscription: Subscription;
  private selectedRemarksSubscription: Subscription;
  private _remarksVisible: boolean;
  private imageHtmlRef: HTMLImageElement;

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
  @Input() remarks: Remark[];
  @Input() pageNumber: number;

  @ViewChild('container') public container: ElementRef;

  constructor(
    private readonly remarksService: RemarksService, 
    private readonly scrollService: RemarksScrollPositionService,
    private readonly sanitizer: DomSanitizer) { 
    
    this.redParams = new RedPencilRemarkDisplayParams();
    this.remarksSubscription = this.remarksService.remarksVisibility.subscribe(v => {
      this._remarksVisible = v;
      this.drawRemarks(v);
    });
    
    this.selectedRemarksSubscription = this.remarksService.selectedRemark.subscribe(selected => {
      if (!selected) {
        return;
      }
      
      this.openPopup(selected);

      var display = this.displayRemarks.find(r => r.remark.id === selected.id);
      if (display) {
        this.scrollService.change(display.scrollTop);
      }
    });
  }

  ngOnDestroy(): void {
    this.remarksSubscription?.unsubscribe();
    this.selectedRemarksSubscription?.unsubscribe();
  }
  
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.image = this.sanitizer.bypassSecurityTrustUrl(this.page);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.imageHtmlRef) {
      this.redraw(this.imageHtmlRef);
    }
  }

  annotationPopupOpen(remark: Remark, $event: Event): void {
    $event.preventDefault();
    $event.stopPropagation();

    this.openPopup(remark);
  }

  isTextNoteRemark(remark: DisplayRemark): boolean {
    return remark.remark.type === RemarkType.TEXT_NOTE || remark.remark.type === RemarkType.STICKY_NOTE;
  }

  isRedPencil(remark: DisplayRemark): boolean {
    return remark.remark.type === RemarkType.RED_PENCIL;
  }

  imageLoaded(img: HTMLImageElement) : void {
    this.imageHtmlRef = img;
    this.redraw(img);
  }

  private redraw(img: HTMLImageElement): void {
    if (this.remarks.length === 0) {
      return;
    }

    console.log("img naturalWidth = " + img.naturalWidth);
    console.log("img naturalHeight = " + img.naturalHeight);
    console.log("img width = " + img.offsetWidth);
    console.log("img height = " + img.offsetHeight);

    let wrh = img.offsetWidth / img.offsetHeight;
    console.log("wrh = " + wrh);
    this._xRatio = img.naturalWidth / img.offsetWidth;
    console.log("this._xRatio = " + this._xRatio);
    this._yRatio = img.naturalHeight / img.offsetHeight;
    this.setupRedPencilDisplayParams(img.offsetWidth, img.offsetHeight);
    this.drawRemarks(this._remarksVisible);
  }

  @HostListener('document:click', ['$event']) 
  private clickedOutside($event): void {
    this.closePopups();
  }

  private closePopups(): void {
    if (this.remarks) {
      this.remarks.forEach(r => {
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
    this.redParams.transform = `scale(${1 / this._xRatio})`;
    console.log(this.redParams);
  }

  private drawRemarks(isDraw: boolean): void {
    this.displayRemarks = new Array();
    if (!isDraw) {
      return;
    }

    if (!this.remarks) {
      return;
    }
    
    const sortedRemarks = [...this.remarks].sort((a, b) => (a.position.top > b.position.top ? -1 : 1));
    for (const remark of sortedRemarks) {
      
      if (remark.pageNumber !== this.pageNumber) {
        continue;
      }

      if (!remark.position) {
        continue;
      }
              
      const displayRemark = new DisplayRemark();
      displayRemark.remark = remark;
      const  x = remark.position.left / this._xRatio;
      const  y = remark.position.top / this._yRatio;
      displayRemark.position = new Point(x, y);
      displayRemark.popupLeft = this.calcRemarkPopupLeft(displayRemark);
      this.displayRemarks.push(displayRemark);
    }
  }
}

@Directive({
  selector: '[appPosition]'
})
export class ElementPositionDirective implements AfterViewInit{

  @Input() appPosition : DisplayRemark;
  constructor(private el: ElementRef) {
  }

  ngAfterViewInit(): void {
    this.appPosition.setElement(this.el);
  }
}
