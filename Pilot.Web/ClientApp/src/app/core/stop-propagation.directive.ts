import { Directive, HostListener } from "@angular/core";

@Directive({
  selector: "[click-stop-propagation]"
})
export class ClickStopPropagation {
  @HostListener("click", ["$event"])
  public onClick(event: any): void {
    event.stopPropagation();
    event.preventDefault();
  }

  @HostListener("mousedown", ["$event"])
  public onMousedown(event: any): void {
    event.stopPropagation();
  }
}

@Directive({
  selector: "[click-prevent-default]"
})
export class ClickPreventDefault {
  @HostListener("click", ["$event"])
  public onClick(event: any): void {
    event.preventDefault();
  }

  @HostListener("mousedown", ["$event"])
  public onMousedown(event: any): void {
    event.preventDefault();
  }
}
