import { ElementRef, HostListener, AfterViewInit, Input, Directive } from '@angular/core';
import { BreadcrumbNode } from "./breadcrumb.node";


@Directive({
  selector: '[appWidthBreadcrumb]'
})
export class WidthBreadcrumbDirective implements AfterViewInit {

  private _breadcrumb: BreadcrumbNode;
  constructor(private el: ElementRef) {
  }

  @Input()
  set appWidthBreadcrumb(value: BreadcrumbNode) {
    this._breadcrumb = value;
  }

  @HostListener('window:resize')
  onResize() {
    this.ngAfterViewInit();
  }

  ngAfterViewInit(): void {
    this._breadcrumb.setWidth(this.el.nativeElement.offsetWidth);
  }
}
