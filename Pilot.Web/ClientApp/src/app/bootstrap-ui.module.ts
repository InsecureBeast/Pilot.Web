import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { ModalModule } from 'ngx-bootstrap/modal';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDropdownModule, BsDropdownConfig } from 'ngx-bootstrap/dropdown';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AlertModule.forRoot(),
    ProgressbarModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  exports: [
    AlertModule,
    ProgressbarModule,
    ModalModule,
    BsDropdownModule
  ],
  providers: [BsDropdownConfig]
})
export class BootstrapUiModule {}
