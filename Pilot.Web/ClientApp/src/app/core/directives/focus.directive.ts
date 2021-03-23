import { Directive, Input, ElementRef } from '@angular/core';

@Directive({ selector: '[appFocus]' })
export class FocusDirective {
  private _isFocused: boolean;

  @Input()
  get appFocus(): boolean {
    return this._isFocused;
  }
  set appFocus(value: boolean) {
    this._isFocused = value;
    if (value === true) {
      this.hostElement.nativeElement.focus();
    }
  }

  constructor(private hostElement: ElementRef) {}
}
