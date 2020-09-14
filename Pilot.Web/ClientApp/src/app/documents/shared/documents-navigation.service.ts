import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { IObject } from 'src/app/core/data/data.classes';

@Injectable({ providedIn: 'root' })
export class DocumentsNavigationService {

  constructor(private router: Router) {
  }

  navigateToDocument(folderId: string, document: string | IObject): void {
    this.navigateToFile(folderId, document);
  }

  navigateToFile(folderId: string, file: string | IObject): void {
    if (typeof file === 'string') {
      //Logic for overload 1
      this.router.navigateByUrl(`/documents/${folderId}/doc/${file}`);
    } else {
      //Logic for overload 2
      this.router.navigateByUrl(`/documents/${folderId}/doc/${file.id}`);
    }
  }

  navigateToDocumentsFolder(folderId: string): void {
    this.router.navigateByUrl('/documents/' + folderId);
  }

  navigateToFilesFolder(folderId: string): void {
    this.router.navigateByUrl('/documents/' + folderId);
  }
}
