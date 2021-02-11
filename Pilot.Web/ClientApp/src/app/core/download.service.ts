import { Injectable } from '@angular/core';
import { first } from 'rxjs/operators';

import { FilesRepositoryService } from './files-repository.service';
import { IObject } from './data/data.classes';
import { FilesSelector } from './tools/files.selector';

@Injectable({ providedIn: 'root' })
export class DownloadService {

  constructor(private readonly filesRepository: FilesRepositoryService) {

  }

  downloadFile(object: IObject): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.filesRepository.getDocumentFile(object.id)
        .pipe(first())
        .subscribe(data => {
          const file = FilesSelector.getSourceFile(object.actualFileSnapshot.files);
          const fileExt = file.name.split('.').pop();
          const name = object.title;
          this.runLoadFile(data, name, 'application/octet-stream');
          resolve(true);
        }, err => reject(err));
    });
  }

  downloadFileArchive(ids: string[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.filesRepository.getFileArchive(ids).then(data => {
        this.runLoadFile(data, 'Archive.zip', 'application/zip');
        resolve(true);
      }, err => reject(err));
    });
  }

  private runLoadFile(data: ArrayBuffer, name: string, dataType: string): void {
    const blob = new Blob([data], { type: dataType });

    // detect whether the browser is IE/Edge or another browser
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      // To IE or Edge browser, using msSaveorOpenBlob method to download file.
      window.navigator.msSaveOrOpenBlob(blob, name);
    } else {
      // To another browser, create a tag to download file.
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.target = '_blank';
      link.download = name;
      link.click();
    }
  }
}
