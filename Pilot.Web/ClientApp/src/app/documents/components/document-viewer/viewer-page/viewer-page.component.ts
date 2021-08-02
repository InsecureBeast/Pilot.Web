import { AfterViewInit, HostListener } from '@angular/core';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Remark, Point } from '../../remarks/remark';


class DisplayRemark {
  remark: Remark;
  position: Point;
}

@Component({
  selector: 'app-viewer-page',
  templateUrl: './viewer-page.component.html',
  styleUrls: ['./viewer-page.component.css']
})
export class ViewerPageComponent implements OnInit, AfterViewInit {
  private _xRatio: number;
  private _yRatio: number;
  private _selectedRemark: Remark;
  
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

  constructor() { }
  
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

      this.displayRemarks = new Array();

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
        this.displayRemarks.push(displayRemark); 

        // const text_info = ctx.measureText(remark.text);
        // ctx.fillStyle = "yellow";
        // ctx.fillRect(x, y, text_info.width, 20);
        // draw font in red
        // ctx.fillStyle = "red";
        // ctx.font = "8pt sans-serif";
        // ctx.fillText(remark.text, x + 5, y + 16);  
      }
      console.log(this.displayRemarks);
    };
    img.src = this.page;
  }

  ngOnInit(): void {
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.ngAfterViewInit();
  }
}