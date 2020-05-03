import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { IObject } from 'src/app/core/data/data.classes';

@Injectable({ providedIn: 'root' })
export class DocumentsNavigationService {

  constructor(private readonly router: Router) {
  }

  navigateToDocument(documentId: string, activatedRoute: ActivatedRoute): void {
    this.router.navigate(['./document/' + documentId], { relativeTo: activatedRoute });
  }

  navigateToDocument(document: IObject): void {
    const url = "/documents/" + document.parentId + "/document/" + document.id;
    this.router.navigateByUrl(url);
  }

  navigateToFile(fileId: string, activatedRoute: ActivatedRoute): void {
    this.router.navigate(['./file/' + fileId], { relativeTo: activatedRoute });
  }

  navigateToFile(document: IObject): void {
    const url = "/documents/" + document.parentId + "/file/" + document.id;
    this.router.navigateByUrl(url);
  }

  navigateToDocumentsFolder(folderId: string): void {
    this.router.navigateByUrl('/documents/' + folderId);
  }

  navigateToFilesFolder(folderId: string): void {
    this.router.navigateByUrl('/files/' + folderId);
  }
}
