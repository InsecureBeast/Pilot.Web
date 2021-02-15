import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {AuthComponent} from "./auth/auth.component";

const routes: Routes = [
  {
    path: '',
    component: AuthComponent
  }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  declarations: []
})
export class AuthRoutingModule {
}
