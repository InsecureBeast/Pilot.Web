import { Injectable } from '@angular/core';
import { IFile, IFileSnapshot } from './data/data.classes';
import { FilesSelector } from './tools/files.selector';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { FilesRepositoryService } from './files-repository.service';
import { Tools } from './tools/tools';

@Injectable({ providedIn: 'root'})
export class SourceFileService {
  constructor(
    private readonly fileStorageService: FilesRepositoryService,
    private readonly sanitizer: DomSanitizer ) {
  }

  fillXpsDocumentPagesAsync(file: IFile, scale: number, cancel: Subject<any>, images: Array<SafeUrl>): Promise<void> {
    let that = this;
    let id = file.body.id;
    return new Promise((resolve, reject) => {
      that.fileStorageService.getDocumentPagesCount(id, file.body.size, scale)
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe(async count => {
            for (let i = 0; i < count; i++) {
              const page = await that.getPageAsync(id, i, cancel);
              images.push(page);
              //resolve();
            }

            resolve();
          },
        e => reject(e));
    });
  }

  async getImageFileToShowAsync(file: IFile, cancel: Subject<any>): Promise<SafeUrl> {
    return new Promise((resolve, reject) => {
      var imageType = this.getImageDataType(file.name);
      if (imageType) {
        this.fileStorageService.getFile(file.body.id, file.body.size)
          .pipe(takeUntil(cancel))
          .subscribe(bytes => {
            var base64 = Tools.arrayBufferToBase64(bytes);
            var url = Tools.getImage(base64, imageType, this.sanitizer);
            resolve(url);
          }, err => reject(err));
        
        return;
      }

      resolve(null);
    });
  }

  async getThumbnailFileToShowAsync(file: IFile, cancel: Subject<any>): Promise<SafeUrl> {
    return new Promise((resolve, reject) => {
        this.fileStorageService.getFile(file.body.id, file.body.size)
          .pipe(takeUntil(cancel))
          .subscribe(bytes => {
            var base64 = Tools.arrayBufferToBase64(bytes);
            var url = Tools.getImage(base64, '.png', this.sanitizer);
            resolve(url);
          }, err => reject(err));
    });
  }

  async getXpsThumbnailAsync(file: IFile, cancel: Subject<any>): Promise<SafeUrl> {
    return new Promise((resolve, reject) => {
      this.fileStorageService.getThumbnail(file.body.id, file.body.size)
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe(bytes => {
          var base64 = Tools.arrayBufferToBase64(bytes);
          var url = Tools.getImage(base64, ".png", this.sanitizer);
          resolve(url);
        }, err => reject(err));
    });
  }

  isImageFile(snapshot: IFileSnapshot): boolean {
    const file = FilesSelector.getSourceFile(snapshot.files);
    if (!file)
      return false;

    const imageType = this.getImageDataType(file.name);
    return imageType != null;
  }

  isSvgFile(snapshot: IFileSnapshot): boolean {
    const file = FilesSelector.getSourceFile(snapshot.files);
    if (!file)
      return false;

    return file.name.endsWith('.svg');
  }

  isXpsFile(snapshot: IFileSnapshot): boolean {
    var file = FilesSelector.getSourceFile(snapshot.files);
    if (!file)
      return false;

    return file.name.endsWith('.xps');
  }

  isKnownFile(snapshot: IFileSnapshot): boolean {
    var file = FilesSelector.getSourceFile(snapshot.files);
    if (!file)
      return false;

    var fileType = this.getFileDataType(file.name);
    return fileType != null;
  }

  openFileAsync(snapshot: IFileSnapshot, cancel: Subject<any>): Promise<void> {
    return new Promise((resolve, reject) => {
      var file = FilesSelector.getSourceFile(snapshot.files);
      if (!file) {
        reject();
        return;
      }

      var fileType = this.getFileDataType(file.name);
      this.fileStorageService.getFile(file.body.id, file.body.size)
        .pipe(takeUntil(cancel))
        .subscribe(data => {
          let blob = new Blob([data], { type: fileType });
          let url = window.URL.createObjectURL(blob);
          let pwa = window.open(url);
          if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
            alert('Please disable your Pop-up blocker and try again.');
            resolve();
          }
          resolve();
        }, err => reject(err));
    });
  }

  private async getPageAsync(fileId: string, page: number, cancel: Subject<any>): Promise<SafeUrl> {
    let that = this;
    return new Promise((resolve, reject) => {
      that.fileStorageService.getDocumentPageContent(fileId, page)
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe(page => {
          var base64 = Tools.arrayBufferToBase64(page);
          var image = Tools.getImage(base64, ".png", that.sanitizer);
            resolve(image);
          },
          e => reject(e));
    });
  }

  private getImageDataType(filename: string): string {

    if (filename.toLowerCase().endsWith(".png")) {
      return '.png';
    }

    if (filename.toLowerCase().endsWith(".svg")) {
      return 'svg+xml;charset=utf-8';
    }

    if (filename.toLowerCase().endsWith(".jpeg")) {
      return '.jpeg';
    }

    if (filename.toLowerCase().endsWith(".jpg")) {
      return '.jpg';
    }

    if (filename.toLowerCase().endsWith(".bmp")) {
      return '.bmp';
    }

    if (filename.toLowerCase().endsWith(".gif")) {
      return '.gif';
    }

    if (filename.toLowerCase().endsWith(".ico")) {
      return '.ico';
    }

    return null;
  }

  private getFileDataType(filename: string): string {
    if (filename.endsWith(".pdf")) {
      return 'application/pdf';
    }

    return null;
  }
}
