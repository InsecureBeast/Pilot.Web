import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'})
export class TasksNavigationService {

  constructor(private router: Router) {
  }

  navigateToFilter(filterId: number): void {
    this.router.navigateByUrl('/tasks/' + filterId);
  }

  navigateToTask(taskId: string): void {
    this.router.navigateByUrl('/tasks/task/' + taskId);
  }

  navigateToDocumentsFolder(folderId: string): void {
    this.router.navigateByUrl('/documents/' + folderId);
  }

  navigateToFilesFolder(folderId: string): void {
    this.router.navigateByUrl('/documents/' + folderId);
  }
}
