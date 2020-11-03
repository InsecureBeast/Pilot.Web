import { NgModule } from '@angular/core';
import { DocumentCardComponent } from './document-card.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
      CommonModule,
      TranslateModule
    ],
    declarations: [
      DocumentCardComponent
    ],
    exports: [
      DocumentCardComponent
    ],
  })
export class DocumentCardModule {
}