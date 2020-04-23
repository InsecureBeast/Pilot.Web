import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorComponent } from './error/error.component';
import { ErrorHandlerService } from './error-handler.service';

@NgModule(
  {
    imports: [
      CommonModule,
      TranslateModule
    ],
    declarations: [
      ErrorComponent
    ],
    exports: [
      ErrorComponent
    ],
  })
export class ErrorModule {
}
