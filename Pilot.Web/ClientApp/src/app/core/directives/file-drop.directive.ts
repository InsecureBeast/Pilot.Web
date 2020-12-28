import { Directive, Output, EventEmitter, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appFileDrop]',
})
export class FileDropDirective {
  @Output() filesDropped = new EventEmitter<FileList>();
  @Output() filesHovered = new EventEmitter();

  @Input() isFileDropDisabled = false;

  private lastEnterElement: HTMLElement;

  @HostListener('drop', ['$event'])
  onDrop($event) {
    if (this.isFileDropDisabled) {
      return;
    }

    $event.preventDefault();
    $event.stopPropagation();

    this.lastEnterElement = null;
    const transfer = $event.dataTransfer;
    this.filesDropped.emit(transfer.files);
    this.filesHovered.emit(false);
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter($event) {
    if (this.isFileDropDisabled) {
      return;
    }

    $event.preventDefault();
    $event.stopPropagation();

    this.lastEnterElement = $event.target;
    this.filesHovered.emit(true);
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event) {
    if (this.isFileDropDisabled) {
      return;
    }

    $event.preventDefault();
    $event.stopPropagation();
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave($event) {
    if (this.isFileDropDisabled) {
      return;
    }

    if (this.lastEnterElement === $event.target) {
      $event.preventDefault();
      $event.stopPropagation();
      this.filesHovered.emit(false);
    }
  }
}
