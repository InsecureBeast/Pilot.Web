import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';
import { BimDocumentComponent } from './bim-document/bim-document.component';

const routes: Routes = [
  { path: ':id/bim/:id', component: BimDocumentComponent, canActivate: [AuthGuard], data: { reuse: false } }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  declarations: []
})
export class BimDocumentRoutingModule {
}
