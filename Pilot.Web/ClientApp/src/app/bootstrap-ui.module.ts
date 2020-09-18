import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProgressbarModule.forRoot(),
    ModalModule.forRoot()
  ],
  exports: [
    ProgressbarModule,
    ModalModule,
  ]
})
export class BootstrapUiModule {}
