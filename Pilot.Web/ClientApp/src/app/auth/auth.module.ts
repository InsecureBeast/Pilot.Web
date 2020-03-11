import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AuthComponent } from './auth/auth.component';

@NgModule({
    imports: [
      CommonModule,
      TranslateModule,
      FormsModule
    ],
    declarations: [
      AuthComponent
    ],
    exports: [
      AuthComponent
    ],
  })
export class AuthModule {
}
