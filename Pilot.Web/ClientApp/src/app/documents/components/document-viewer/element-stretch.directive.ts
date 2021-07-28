import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appElementStretch]'
})
export class ElementStretchDirective {

  private _elementRef: ElementRef;
  constructor(private el: ElementRef) {

  }

  @Input()
  set appElementStretch(value: ElementRef) {
    this._elementRef = value;
  }

  @HostListener('window:resize')
  onResize() {
    this.ngAfterViewInit();
  }

  ngAfterViewInit(): void {

    
  }

}
