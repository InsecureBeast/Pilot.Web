import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { IObject } from 'src/app/core/data/data.classes';
import { SystemIds } from 'src/app/core/data/system.ids';

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

  navigateToDocumentsFolder(folderId: string, replaceUrl = false): void {
    this.router.navigate([`/documents/${folderId}`], { replaceUrl: replaceUrl });
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
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.navigateToDocumentsFolder(SystemIds.rootId);
    }
  }

  navigateToDocumentVersions(parentId: string, documentId: string, replaceUrl = true): void {
    this.router.navigate([`/documents/${parentId}/doc/${documentId}/versions`], { replaceUrl: replaceUrl });
  }

  navigateToDocumentVersion(folderId: string, id: string, version?: string, replaceUrl = true): void {
    this.location.replaceState('', null);
    if (!version) {
      this.router.navigate([`/documents/${folderId}/doc/${id}`], { replaceUrl: replaceUrl });
    } else {
      this.router.navigate([`/documents/${folderId}/doc/${id}/${version}`], { replaceUrl: replaceUrl });
    }
  }

  navigateToDocumentSignatures(parentId: string, documentId: string, replaceUrl = true): void {
    this.router.navigate([`/documents/${parentId}/doc/${documentId}/signatures`], { replaceUrl: replaceUrl });
  }

  navigateToSearchDocuments(folderId: string, request: string): void {
    this.router.navigate([`/documents/${folderId}/search`], { queryParams: { q: request } });
  }

  navigateToSearchFiles(folderId: string, request: string): void {
    this.router.navigate([`/documents/${folderId}/files/search`], { queryParams: { q: request } });
  }

}
