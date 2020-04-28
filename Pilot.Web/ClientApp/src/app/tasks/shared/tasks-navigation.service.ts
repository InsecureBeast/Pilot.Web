import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({providedIn: 'root'})
export class TasksNavigationService {

  constructor(private readonly router: Router) {
  }

  navigateToFilter(filterId: string): void {
    this.router.navigateByUrl('/tasks/' + filterId);
  }

  navigateToTask(taskId: string): void {
    //this.router.navigate(['./task/' + taskId], { relativeTo: activatedRoute });
    this.router.navigateByUrl('/task/' + taskId);
  }

  navigateToDocumentsFolder(folderId: string): void {
    this.router.navigateByUrl('/documents/' + folderId);
  }

  navigateToFilesFolder(folderId: string): void {
    this.router.navigateByUrl('/files/' + folderId);
  }
}
