import { AfterViewInit, Directive, HostListener, OnDestroy } from '@angular/core';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { RemarksService } from 'src/app/documents/shared/remarks.service';
import { Remark, Point } from '../../remarks/remark';
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

  displayRemarks: DisplayRemark[];
  image: SafeUrl;
  
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
    var containerEl = this.container.nativeElement;

    var img = new Image();
    img.onload = () => {
      var wrh = img.width / img.height;
      var newWidth = containerEl.offsetWidth;
      var newHeight = (newWidth / wrh);
      this._xRatio = img.width / newWidth;
      this._yRatio = img.height / newHeight;
      this.image = this.sanitizer.bypassSecurityTrustUrl(this.page);
      
      this.drawRemarks(this._remarksVisible);
    };
    img.src = this.page;
  }

  ngOnInit(): void {
    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.ngAfterViewInit();
  }

  annotationPopupOpen(remark: Remark, $event: Event): void {
    $event.preventDefault();
    $event.stopPropagation();

    this.openPopup(remark);
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

  private drawRemarks(isDraw: boolean): void {
    this.displayRemarks = new Array();

    if (!isDraw) {
      return;
    }

    if (!this.remarks) {
      return;
    }
    
    for (const remark of this.remarks) {
      
      if (remark.pageNumber !== this.pageNumber) {
        continue;
      }

      if (!remark.position) {
        continue;
      }
              
      const displayRemark = new DisplayRemark();
      displayRemark.remark = remark;
      const x = remark.position.left / this._xRatio;
      const y = remark.position.top / this._yRatio;
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
