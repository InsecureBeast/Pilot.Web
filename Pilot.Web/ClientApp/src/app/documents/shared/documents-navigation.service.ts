import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class DocumentsNavigationService {
  constructor(private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly location: Location) {

  }

  navigateToDocument(documentId: string, activatedRoute: ActivatedRoute): void {
    this.router.navigate(['./document/' + documentId], { relativeTo: activatedRoute });
  }

  navigateToFile(fileId: string, activatedRoute: ActivatedRoute): void {
    this.router.navigate(['./file/' + fileId], { relativeTo: activatedRoute });
  }

  navigateToDocumentsFolder(folderId: string): void {
    this.router.navigateByUrl('/documents/' + folderId);
  }

  navigateToFilesFolder(folderId: string): void {
    this.router.navigateByUrl('/files/' + folderId);
  }

}
