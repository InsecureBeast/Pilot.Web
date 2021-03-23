import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { IBottomSheetConfig } from 'src/app/components/bottom-sheet/bottom-sheet/bottom-sheet.config';
import { SlideUpToggleAnimation } from './bottom-sheet.animation';

@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.css'],
  animations: [SlideUpToggleAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BottomSheetComponent implements OnInit {

  @Input() options: IBottomSheetConfig;

  flags: any = {
    isBottomSheetEnabled: false
  };

  constructor(private changeDetector: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.flags.isCloseButtonEnabled = this.options.enableCloseButton ? true : false;
    this.options.closeButtonTitle = this.options.closeButtonTitle ? this.options.closeButtonTitle : 'Close';
  }

  /**
  * Opens bottom sheet component
  */
  open() {
    this.flags.isBottomSheetEnabled = true;
    this.changeDetector.detectChanges();
  }

  /**
  * Closes bottom sheet component
  */
  close() {
    this.flags.isBottomSheetEnabled = false;
    this.changeDetector.detectChanges();
  }

  /**
  * Toggles bottom sheet component
  */
  toggle() {
    this.flags.isBottomSheetEnabled = !this.flags.isBottomSheetEnabled;
    this.changeDetector.detectChanges();
  }

  /**
  * Toggles close button
  */
  toggleCloseButton() {
    this.flags.isCloseButtonEnabled = !this.flags.isCloseButtonEnabled;
    this.changeDetector.detectChanges();
  }

  /**
  * Toggles dark theme
  */
  toggleDarkTheme() {
    this.options.darkTheme = !this.options.darkTheme;
    this.changeDetector.detectChanges();
  }
}
