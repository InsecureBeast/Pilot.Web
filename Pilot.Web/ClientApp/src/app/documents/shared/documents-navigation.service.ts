import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { IObject } from 'src/app/core/data/data.classes';

@Injectable({ providedIn: 'root' })
export class DocumentsNavigationService {

  constructor(private readonly router: Router) {
  }

  navigateToDocument(document: string | IObject, activatedRoute?: ActivatedRoute): void {
    if (typeof document === 'string') {
      //Logic for overload 1
      this.router.navigate(['./document/' + document], { relativeTo: activatedRoute });
    } else {
      //Logic for overload 2
      const url = "/documents/" + document.parentId + "/document/" + document.id;
      this.router.navigateByUrl(url);
    }
  }

  navigateToFile(file: string | IObject, activatedRoute?: ActivatedRoute): void {
    if (typeof file === 'string') {
      //Logic for overload 1
      this.router.navigate(['./file/' + file], { relativeTo: activatedRoute });
    } else {
      //Logic for overload 2
      const url = "/documents/" + file.parentId + "/file/" + file.id;
      this.router.navigateByUrl(url);
    }
  }

  navigateToDocumentsFolder(folderId: string): void {
    this.router.navigateByUrl('/documents/' + folderId);
  }

  navigateToFilesFolder(folderId: string): void {
    this.router.navigateByUrl('/files/' + folderId);
  }
}
