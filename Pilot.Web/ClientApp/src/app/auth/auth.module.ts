import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AuthComponent } from './auth/auth.component';
import {AuthRoutingModule} from "./auth-routing.module";

@NgModule({
    imports: [
      CommonModule,
      TranslateModule,
      FormsModule,
      AuthRoutingModule
    ],
    declarations: [
      AuthComponent
    ],
    exports: [
      AuthComponent,
      AuthRoutingModule
    ],
  })
export class AuthModule {
}
