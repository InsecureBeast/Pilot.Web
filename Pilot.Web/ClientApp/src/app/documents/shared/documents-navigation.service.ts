import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IObject } from 'src/app/core/data/data.classes';

@Injectable({ providedIn: 'root' })
export class DocumentsNavigationService {

  constructor(private router: Router, private readonly location: Location) {
  }

  navigateToDocument(folderId: string, document: string | IObject): void {
    if (typeof document === 'string') {
      // Logic for overload 1
      this.router.navigateByUrl(`/documents/${folderId}/doc/${document}`);
    } else {
      // Logic for overload 2
      this.router.navigateByUrl(`/documents/${folderId}/doc/${document.id}`);
    }
  }

  navigateToFile(folderId: string, document: string | IObject): void {
    if (typeof document === 'string') {
      // Logic for overload 1
      this.router.navigateByUrl(`/documents/${folderId}/files/doc/${document}`);
    } else {
      // Logic for overload 2
      this.router.navigateByUrl(`/documents/${folderId}/files/doc/${document.id}`);
    }
  }

  navigateToDocumentsFolder(folderId: string): void {
    this.router.navigateByUrl(`/documents/${folderId}`);
  }

  navigateToFilesFolder(folderId: string): void {
    this.router.navigateByUrl(`/documents/${folderId}/files`);
  }

  updateLocation(folderId: string, id: string, version?: string): void {
    if (!version) {
      this.location.replaceState(`/documents/${folderId}/doc/${id}`);
    } else {
      this.location.replaceState(`/documents/${folderId}/doc/${id}/${version}`);
    }
  }

  back(): void {
    // TODO go to documents root if location stack is empty.
    this.location.back();
  }
}
