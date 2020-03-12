import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentsComponent } from './pages/documents/documents.component';
import { DocumentComponent } from './pages/document/document.component';
import { DocumentListComponent } from './components/document-list/document-list.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule
  ],
  declarations: [
    DocumentsComponent,
    DocumentComponent,
    DocumentListComponent
  ],
  exports: [
    DocumentsComponent,
    DocumentComponent,
    DocumentListComponent
  ],
})
export class DocumentsModule {}
