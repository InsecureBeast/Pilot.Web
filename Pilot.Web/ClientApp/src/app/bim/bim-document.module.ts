import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { BimDocumentRoutingModule } from './bim-document-routing.module';
import { BimDocumentComponent } from './bim-document/bim-document.component';

@NgModule({
  imports: [
    CommonModule,
    //ErrorModule,
    RouterModule,
    TranslateModule,
    BimDocumentRoutingModule
   
  ],
  declarations: [
    BimDocumentComponent
  ],
  exports: [
    BimDocumentComponent
  ]
})
export class BimDocumentModule {
}
