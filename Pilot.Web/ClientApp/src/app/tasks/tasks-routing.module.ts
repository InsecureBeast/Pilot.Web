import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/auth.guard';
import { TasksComponent } from './pages/tasks/tasks.component';
import { TaskComponent } from './pages/task/task.component';


const routes: Routes = [
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [AuthGuard],
    data: { reuse: true }
    //children: [
    //{ path: ':id', component: TasksComponent, canActivate: [AuthGuard] },
    //{ path: 'task/:id', component: TaskComponent, canActivate: [AuthGuard] }
    //]
  },
  {
    path: 'tasks/:filterId',
    component: TasksComponent,
    canActivate: [AuthGuard],
    data: { reuse: true }
    //children: [
      //{ path: ':id', component: TasksComponent, canActivate: [AuthGuard] },
      //{ path: 'task/:id', component: TaskComponent, canActivate: [AuthGuard] }
    //]
  },
  {
    path: 'task/:id',
    component: TaskComponent,
    canActivate: [AuthGuard]
    //children: [
      //{ path: 'filter/:id', component: TasksComponent, canActivate: [AuthGuard] },
      //{ path: 'task/:id', component: TaskComponent, canActivate: [AuthGuard] }
    //]
  }
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
