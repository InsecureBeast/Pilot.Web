import { NgModule } from '@angular/core';
import { UserStateComponent } from './user-state.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    UserStateComponent
  ],
  exports: [
    UserStateComponent
  ],
})
export class UserStateModule {
}