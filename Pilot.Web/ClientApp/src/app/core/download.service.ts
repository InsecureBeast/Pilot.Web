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
      var file = FilesSelector.getSourceFile(object.actualFileSnapshot.files);
      this.filesRepository.getFile(file.body.id, file.body.size)
        .pipe(first())
        .subscribe(data => {
          const fileExt = file.name.split('.').pop();
          const name = object.title + '.' + fileExt;
          this.runLoadFile(data, name, "application/octet-stream");
          resolve(true);
        }, err => reject(err));
    });
  }

  downloadFileArchive(ids: string[]): void {
    this.filesRepository.getFileArchive(ids).then(data => {
      this.runLoadFile(data, "Archive.zip", "application/zip");
    });
  }

  private runLoadFile(data: ArrayBuffer, name: string, dataType: string): void {
    const blob = new Blob([data], { type: dataType });
    
    //detect whether the browser is IE/Edge or another browser
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      //To IE or Edge browser, using msSaveorOpenBlob method to download file.
      window.navigator.msSaveOrOpenBlob(blob, name);
    } else {
      //To another browser, create a tag to downlad file.
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = name;
      a.click();

      window.URL.revokeObjectURL(url);
      a.remove();
    }
    //document.body.removeChild(a);
    //URL.revokeObjectURL(objectUrl);
  }
}
