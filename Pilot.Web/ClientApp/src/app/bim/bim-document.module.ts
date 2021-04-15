import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { BimDocumentRoutingModule } from './bim-document-routing.module';
import { BimDocumentComponent } from './bim-document/bim-document.component';
import { BimTreeviewComponent } from './bim-treeview/bim-treeview.component';
import { TreeviewModule } from 'ngx-treeview';
import { BimNodePropertiesComponent } from './bim-node-properties/bim-node-properties.component';

@NgModule({
  imports: [
    CommonModule,
    //ErrorModule,
    RouterModule,
    TranslateModule,
    BimDocumentRoutingModule,
    TreeviewModule.forRoot()
  ],
  declarations: [
    BimDocumentComponent,
    BimTreeviewComponent,
    BimNodePropertiesComponent
  ],
  exports: [
    BimDocumentComponent
  ]
})
export class BimDocumentModule {
}
