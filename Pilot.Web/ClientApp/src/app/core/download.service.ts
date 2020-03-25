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
          this.runLoadFile(data, file.name, "application/octet-stream");
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
    const objectUrl: string = URL.createObjectURL(blob);
    const a = document.createElement("a") as HTMLAnchorElement;

    a.href = objectUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  }
}
