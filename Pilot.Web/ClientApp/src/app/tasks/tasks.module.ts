import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { TaskFiltersComponent } from './components/task-filters/task-filters.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskDetailsComponent } from './components/task-details/task-details.component';
import { TaskAttachmentsComponent } from './components/task-attachments/task-attachments.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { TaskComponent } from './pages/task/task.component';
import { TasksRoutingModule } from './tasks-routing.module';
import { TaskToolbarComponent } from './components/task-toolbar/task-toolbar.component';
import { ErrorModule } from '../components/error/error.module';
import { CustomModalModule } from '../components/modal/modal.module';
import { BottomSheetModule } from '../components/bottom-sheet/bottom-sheet.module';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    CommonModule,
    ErrorModule,
    RouterModule,
    TranslateModule,
    CustomModalModule,
    TasksRoutingModule,
    BottomSheetModule
  ],
  declarations: [
    TaskFiltersComponent,
    TaskListComponent,
    TaskDetailsComponent,
    TaskAttachmentsComponent,
    TasksComponent,
    TaskComponent,
    TaskToolbarComponent
  ],
  exports: [
    TasksComponent
  ]
})
export class TasksModule {
}
