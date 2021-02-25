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
import { DocumentVersionsComponent } from './components/document-versions/document-versions.component';
import { DocumentsRoutingModule } from './documents-routing.module';
import { DocumentTreeComponent } from './components/document-tree/document-tree.component';
import { DigitalSignaturesComponent } from './components/digital-signatures/digital-signatures.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FileDropDirective } from '../core/directives/file-drop.directive';
import { BootstrapUiModule } from '../bootstrap-ui.module';
import { CustomModalModule } from '../components/modal/modal.module';
import { ErrorModule } from '../components/error/error.module';
import { UserStateModule } from '../components/user-state/user-state-module';
import { ObjectCardDialogModule } from '../components/object-card-dialog/object-card-dialog.module';
import { DocumentCardModule } from '../components/document-card/document-card.module';
import { BottomSheetModule } from '../components/bottom-sheet/bottom-sheet.module';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { VersionsComponent } from './pages/versions/versions.component';
import { SignaturesComponent } from './pages/signatures/signatures.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    CustomModalModule,
    ErrorModule,
    DocumentsRoutingModule,
    UserStateModule,
    ObjectCardDialogModule,
    DocumentCardModule,
    BootstrapUiModule,
    TabsModule,
    BottomSheetModule
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
    DigitalSignaturesComponent,
    ContextMenuComponent,
    VersionsComponent,
    SignaturesComponent
  ],
  exports: [
    DocumentsComponent,
    DocumentComponent,
    FileDropDirective
  ],
})
export class DocumentsModule {}
