import { AfterViewInit, Directive, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { DisplayRemark } from './viewer-page.component';

@Directive({
  selector: '[appRemarkLoaded]'
})
export class RemarkLoadedDirective implements AfterViewInit {

  @Input() appRemarkLoaded: DisplayRemark;

  constructor() { }

  ngAfterViewInit(): void {
    
    let path = document.getElementById(this.appRemarkLoaded.remark.id + 'path');
    this.appRemarkLoaded.boundRect = path.getBoundingClientRect();

    let div = document.getElementById(this.appRemarkLoaded.remark.id + '-clickArea');
    div.style.width = `${this.appRemarkLoaded.boundRect.width + 10}px`;
    div.style.height = `${this.appRemarkLoaded.boundRect.height + 10}px`;
    div.style.top = `${this.appRemarkLoaded.position.top - 5}px`;
    div.style.left = `${this.appRemarkLoaded.position.left - 5}px`;
    div.style.marginBottom = `-${(this.appRemarkLoaded.boundRect.height + 10)}px`;
  }
}
