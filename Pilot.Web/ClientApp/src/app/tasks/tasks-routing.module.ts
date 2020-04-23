import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';
import { TasksComponent } from './pages/tasks/tasks.component';


const routes: Routes = [
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [AuthGuard],
    //children: [
    //    { path: 'document/:id', component: DocumentComponent, canActivate: [AuthGuard] },
    //    { path: 'document/:id/:v', component: DocumentComponent, canActivate: [AuthGuard] }
    //  ]
  },
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })
  ],
  exports: [RouterModule],
  declarations: []
})
export class TasksRoutingModule {
}
