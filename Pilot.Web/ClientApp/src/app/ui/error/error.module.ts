import { NgModule } from '@angular/core';
import { ErrorComponent } from './error/error.component';
import { ErrorHandlerService } from './error-handler.service';

@NgModule(
  {
    imports: [
     // CommonModule
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
