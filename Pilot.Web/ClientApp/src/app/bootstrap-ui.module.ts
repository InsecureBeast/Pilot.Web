import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { ModalModule } from 'ngx-bootstrap/modal';
import { AlertModule } from 'ngx-bootstrap/alert';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AlertModule.forRoot(),
    ProgressbarModule.forRoot(),
    ModalModule.forRoot()
  ],
  exports: [
    AlertModule,
    ProgressbarModule,
    ModalModule,
  ]
})
export class BootstrapUiModule {}
