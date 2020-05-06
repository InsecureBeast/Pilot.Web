import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { IObject } from 'src/app/core/data/data.classes';

@Injectable({ providedIn: 'root' })
export class DocumentsNavigationService {

  constructor(private router: Router) {
  }

  navigateToDocument(document: string | IObject): void {
    if (typeof document === 'string') {
      //Logic for overload 1
      this.router.navigateByUrl('/document/' + document);
    } else {
      //Logic for overload 2
      this.router.navigateByUrl('/document/' + document.id);
    }
  }

  navigateToFile(file: string | IObject): void {
    if (typeof file === 'string') {
      //Logic for overload 1
      this.router.navigateByUrl('/file/' + file);
    } else {
      //Logic for overload 2
      this.router.navigateByUrl('/file/' + file.id);
    }
  }

  navigateToDocumentsFolder(folderId: string): void {
    this.router.navigateByUrl('/documents/' + folderId);
  }

  navigateToFilesFolder(folderId: string): void {
    this.router.navigateByUrl('/files/' + folderId);
  }
}
