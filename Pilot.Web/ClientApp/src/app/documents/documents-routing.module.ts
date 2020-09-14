import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentsComponent } from './pages/documents/documents.component';
import { DocumentComponent } from './pages/document/document.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
  { path: '', component: DocumentsComponent, canActivate: [AuthGuard], data: { reuse: false }},
  { path: ':id', component: DocumentsComponent, canActivate: [AuthGuard], data: { reuse: false }},
  { path: 'doc/:id', component: DocumentComponent, canActivate: [AuthGuard] },
  { path: 'doc/:id/:v', component: DocumentComponent, canActivate: [AuthGuard] },
  { path: ':fid/doc/:id', component: DocumentComponent, canActivate: [AuthGuard] },
  { path: ':fid/doc/:id/:v', component: DocumentComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  declarations: []
})
export class DocumentsRoutingModule {}
