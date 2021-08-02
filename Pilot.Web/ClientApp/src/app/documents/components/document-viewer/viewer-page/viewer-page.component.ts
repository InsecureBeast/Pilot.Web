import { AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { RemarksService } from 'src/app/documents/shared/remarks.service';
import { Remark, Point } from '../../remarks/remark';

class DisplayRemark {
  remark: Remark;
  position: Point;
  popupLeft: number;
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
  private _remarksVisible: boolean;

  displayRemarks: DisplayRemark[];

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

  @ViewChild('canvas') public canvas: ElementRef;
  @ViewChild('container') public container: ElementRef;

  constructor(private readonly remarksService: RemarksService) { 
    this.remarksSubscription = this.remarksService.remarksVisibility.subscribe(v => {
      this._remarksVisible = v;
      this.drawRemarks(v);
    });
  }
  
  ngOnDestroy(): void {
    this.remarksSubscription.unsubscribe();
  }
  
  ngAfterViewInit(): void {
    var canvasEl = this.canvas.nativeElement;
    var ctx = canvasEl.getContext('2d');
    var containerEl = this.container.nativeElement;

    var img = new Image();
    img.onload = () => {
      var wrh = img.width / img.height;
      var newWidth = containerEl.offsetWidth;
      var newHeight = (newWidth / wrh);
      canvasEl.width = newWidth;
      canvasEl.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      this._xRatio = img.width / newWidth;
      this._yRatio = img.height / newHeight;
      
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

  private calcRemarkPopupLeft(remark: DisplayRemark): number {
    var containerEl = this.container.nativeElement;
    const width = containerEl.offsetWidth;
    const marginLeft = 10;
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
