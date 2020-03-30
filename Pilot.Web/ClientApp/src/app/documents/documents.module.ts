import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentsComponent } from './pages/documents/documents.component';
import { DocumentComponent } from './pages/document/document.component';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { BreadcrumbsComponent } from "./components/breadcrumbs/breadcrumbs.component";
import { DocumentToolbarComponent } from "./components/document-toolbar/document-toolbar.component";
import { DocumentsToolbarComponent } from "./components/documents-toolbar/documents-toolbar.component";
import { ModalModule } from "../ui/modal/modal.module";
import { ErrorModule } from "../ui/error/error.module";

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    ModalModule,
    ErrorModule
  ],
  declarations: [
    DocumentsComponent,
    DocumentComponent,
    DocumentListComponent,
    BreadcrumbsComponent,
    DocumentToolbarComponent,
    DocumentsToolbarComponent
  ],
  exports: [
    DocumentsComponent,
    DocumentComponent,
    DocumentListComponent
  ],
})
export class DocumentsModule {}
