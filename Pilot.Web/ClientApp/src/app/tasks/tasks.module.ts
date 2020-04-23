import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { ErrorModule } from '../ui/error/error.module';
import { TaskFiltersComponent } from './components/task-filters/task-filters.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskDetailsComponent } from './components/task-details/task-details.component';
import { TaskAttachmentsComponent } from './components/task-attachments/task-attachments.component';
import { TasksComponent } from './pages/tasks/tasks.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    CommonModule,
    ErrorModule
  ],
  declarations: [
    TaskFiltersComponent,
    TaskListComponent,
    TaskDetailsComponent,
    TaskAttachmentsComponent,
    TasksComponent
  ],
  exports: [
    TasksComponent
  ]
})
export class TasksModule {
}
