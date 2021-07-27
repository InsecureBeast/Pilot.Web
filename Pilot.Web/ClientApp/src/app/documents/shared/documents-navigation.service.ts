import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router, NavigationStart, RoutesRecognized } from '@angular/router';

import { IObject } from 'src/app/core/data/data.classes';
import { SystemIds } from 'src/app/core/data/system.ids';
import { filter, pairwise } from 'rxjs/operators';
import { RepositoryService } from 'src/app/core/repository.service';
import { RequestType } from 'src/app/core/headers.provider';

@Injectable({ providedIn: 'root' })
export class DocumentsNavigationService {
  currentUrl: string;
  previousUrl: any;

  constructor(private router: Router, private readonly location: Location, repository: RepositoryService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const startEvent = <NavigationStart>event;
        if (startEvent.navigationTrigger === 'popstate') {
          repository.setRequestType(RequestType.FromCache);
        }
      }
    });

    this.router.events
      .pipe(filter((e: any) => e instanceof RoutesRecognized),
          pairwise()
      ).subscribe((e: any) => {
        this.previousUrl = e[0].urlAfterRedirects;
        // console.log(e[0].urlAfterRedirects); // previous url
      });
  }

  navigateToDocument(folderId: string, document: string | IObject): void {
    if (typeof document === 'string') {
      // Logic for overload 1
      this.currentUrl = `/documents/${folderId}/doc/${document}`;
      this.router.navigateByUrl(this.currentUrl);
    } else {
      // Logic for overload 2
      this.currentUrl = `/documents/${folderId}/doc/${document.id}`;
      this.router.navigateByUrl(this.currentUrl);
    }
  }

  navigateToFile(folderId: string, document: string | IObject): void {
    if (typeof document === 'string') {
      // Logic for overload 1
      this.currentUrl = `/documents/${folderId}/files/doc/${document}`;
      this.router.navigateByUrl(this.currentUrl);
    } else {
      // Logic for overload 2
      this.currentUrl = `/documents/${folderId}/files/doc/${document.id}`;
      this.router.navigateByUrl(this.currentUrl);
    }
  }

  navigateToDocumentsFolder(folderId: string, replaceUrl = false): void {
    this.currentUrl = `/documents/${folderId}`;
    this.router.navigate([this.currentUrl], { replaceUrl: replaceUrl });
  }

  navigateToFilesFolder(folderId: string): void {
    this.currentUrl = `/documents/${folderId}/files`;
    this.router.navigateByUrl(this.currentUrl);
  }

  updateLocation(folderId: string, id: string, version?: string): void {
    if (!version) {
      this.currentUrl = `/documents/${folderId}/doc/${id}`;
      this.location.replaceState(this.currentUrl);
    } else {
      this.currentUrl = `/documents/${folderId}/doc/${id}/${version}`;
      this.location.replaceState(this.currentUrl);
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
    this.currentUrl = `/documents/${parentId}/doc/${documentId}/versions`;
    this.router.navigate([this.currentUrl], { replaceUrl: replaceUrl });
  }

  navigateToDocumentVersion(folderId: string, id: string, version?: string, replaceUrl = true): void {
    this.location.replaceState('', null);
    if (!version) {
      this.currentUrl = `/documents/${folderId}/doc/${id}`;
      this.router.navigate([this.currentUrl], { replaceUrl: replaceUrl });
    } else {
      this.currentUrl = `/documents/${folderId}/doc/${id}/${version}`;
      this.router.navigate([this.currentUrl], { replaceUrl: replaceUrl });
    }
  }

  navigateToDocumentSignatures(parentId: string, documentId: string, replaceUrl = true): void {
    this.currentUrl = `/documents/${parentId}/doc/${documentId}/signatures`;
    this.router.navigate([this.currentUrl], { replaceUrl: replaceUrl });
  }

  navigateToSearchDocuments(folderId: string, request: string): void {
    this.currentUrl = `/documents/${folderId}/search`;
    this.router.navigate([this.currentUrl], { queryParams: { q: request } });
  }

  navigateToSearchFiles(folderId: string, request: string): void {
    this.currentUrl = `/documents/${folderId}/files/search`;
    this.router.navigate([this.currentUrl], { queryParams: { q: request } });
  }

  navigateToDocumentRemarks(parentId: string, documentId: string, replaceUrl = true) {
    this.currentUrl = `/documents/${parentId}/doc/${documentId}/remarks`;
    this.router.navigate([this.currentUrl], { replaceUrl: replaceUrl });
  }
}
