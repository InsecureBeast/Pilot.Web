import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DocumentsComponent } from './pages/documents/documents.component';
import { DocumentComponent } from './pages/document/document.component';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { DocumentToolbarComponent } from './components/document-toolbar/document-toolbar.component';
import { DocumentsToolbarComponent } from './components/documents-toolbar/documents-toolbar.component';
import { CustomModalModule } from '../ui/modal/modal.module';
import { SideModalModule } from '../ui/side-modal/side-modal.module';
import { ErrorModule } from '../ui/error/error.module';
import { DocumentVersionsComponent } from './components/document-versions/document-versions.component';
import { DocumentsRoutingModule } from './documents-routing.module';
import { DocumentTreeComponent } from './components/document-tree/document-tree.component';
import { UserStateModule } from '../ui/user-state/user-state-module';
import { ObjectCardDialogModule } from '../ui/object-card-dialog/object-card-dialog.module';
import { DigitalSignaturesComponent } from './components/digital-signatures/digital-signatures.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FileDropDirective } from '../core/directives/file-drop.directive';
import { BootstrapUiModule } from "../bootstrap-ui.module";

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    CustomModalModule,
    SideModalModule,
    ErrorModule,
    DocumentsRoutingModule,
    UserStateModule,
    ObjectCardDialogModule,
    BootstrapUiModule,
    TabsModule
  ],
  declarations: [
    DocumentsComponent,
    DocumentComponent,
    DocumentListComponent,
    BreadcrumbsComponent,
    DocumentToolbarComponent,
    DocumentVersionsComponent,
    DocumentsToolbarComponent,
    DocumentTreeComponent,
    FileDropDirective,
    DigitalSignaturesComponent
  ],
  exports: [
    DocumentsComponent,
    DocumentComponent,
    FileDropDirective
  ],
})
export class DocumentsModule {}
