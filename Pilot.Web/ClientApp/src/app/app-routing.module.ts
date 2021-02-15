import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'documents',
    canActivate: [AuthGuard]
  },
  {
    path: 'documents',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./documents/documents.module').then((x) => x.DocumentsModule),
  },
  {
    path: 'tasks',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./tasks/tasks.module').then((x) => x.TasksModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./auth/auth.module').then((x) => x.AuthModule),
  },
  // otherwise redirect to home
  { path: '*', redirectTo: 'login' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'disabled'
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
