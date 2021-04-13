import { NgModule } from '@angular/core';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    
  ],
  declarations: [
    BottomSheetComponent
  ],
  exports: [
    BottomSheetComponent
  ],
})
export class BottomSheetModule {
}
