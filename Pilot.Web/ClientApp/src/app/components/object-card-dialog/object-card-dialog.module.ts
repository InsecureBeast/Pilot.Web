import { NgModule } from '@angular/core';
import { ObjectCardDialogComponent } from './object-card-dialog.component';
import { CommonModule } from '@angular/common';
import { DocumentCardComponent } from '../document-card/document-card.component';
import { DocumentCardModule } from '../document-card/document-card.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
      CommonModule,
      TranslateModule,
      DocumentCardModule
    ],
    declarations: [
      ObjectCardDialogComponent
    ],
    exports: [
      ObjectCardDialogComponent
    ],
  })
export class ObjectCardDialogModule {
}