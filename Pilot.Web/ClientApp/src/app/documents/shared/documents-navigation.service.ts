import { Injectable } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import { IObject } from 'src/app/core/data/data.classes';

@Injectable({ providedIn: 'root' })
export class DocumentsNavigationService {

  constructor(private router: Router) {
  }

  navigateToDocument(folderId: string, document: string | IObject): void {
    if (typeof document === 'string') {
      //Logic for overload 1
      this.router.navigateByUrl(`/documents/${folderId}/doc/${document}`);
    } else {
      //Logic for overload 2
      this.router.navigateByUrl(`/documents/${folderId}/doc/${document.id}`);
    }
  }

  navigateToFile(folderId: string, document: string | IObject): void {
    if (typeof document === 'string') {
      //Logic for overload 1
      this.router.navigateByUrl(`/documents/${folderId}/files/doc/${document}`);
    } else {
      //Logic for overload 2
      this.router.navigateByUrl(`/documents/${folderId}/files/doc/${document.id}`);
    }
  }

  navigateToDocumentsFolder(folderId: string): void {
    this.router.navigateByUrl(`/documents/${folderId}`);
  }

  navigateToFilesFolder(folderId: string): void {
    this.router.navigateByUrl(`/documents/${folderId}/files`);
  }

  navigateToCoordinationModel(folderId: string, modelId: string): void {
    this.router.navigateByUrl(`/documents/${folderId}/bim/${modelId}`);
  }
}
