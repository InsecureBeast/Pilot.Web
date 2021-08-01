import { AfterViewInit, HostListener } from '@angular/core';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Remark, Point } from '../../remarks/remark';

@Component({
  selector: 'app-viewer-page',
  templateUrl: './viewer-page.component.html',
  styleUrls: ['./viewer-page.component.css']
})
export class ViewerPageComponent implements OnInit, AfterViewInit {
  private _xRatio: number;
  private _yRatio: number;
  private _selectedRemark: Remark;

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

  constructor() { }
  
  ngAfterViewInit(): void {
    var canvasEl = this.canvas.nativeElement;
    var ctx = canvasEl.getContext('2d');
    var containerEl = this.container.nativeElement;
    var remarks = this.remarks;
    var pageNumber = this.pageNumber;

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

      for (const remark of remarks) {
        
        if (!remark.position) {
          continue;
        }
        
        if (remark.pageNumber !== pageNumber) {
          continue;
        }
        
        const x = remark.position.left / this._xRatio;
        const y = remark.position.top / this._yRatio;
        
        const text_info = ctx.measureText(remark.text);
        ctx.fillStyle = "yellow";
        ctx.fillRect(x, y, text_info.width, 20);
        // draw font in red
        ctx.fillStyle = "red";
        ctx.font = "8pt sans-serif";
        ctx.fillText(remark.text, x + 5, y + 16);  
      }
    };
    img.src = this.page;
  }

  ngOnInit(): void {
  }

  calcPosition(remark: Remark): Point {
    if (!remark) {
      return new Point(0,0);
    }
    const x = remark.position.left / this._xRatio;
    const y = remark.position.top / this._yRatio;
    return new Point(x, y);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.ngAfterViewInit();
  }
}
