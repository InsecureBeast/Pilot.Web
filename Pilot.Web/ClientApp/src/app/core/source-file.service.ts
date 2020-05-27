import { Injectable } from '@angular/core';
import { IFile, IFileSnapshot } from './data/data.classes';
import { FilesSelector } from './tools/files.selector';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { FilesRepositoryService } from './files-repository.service';
import { Tools } from './tools/tools';
import { IndexedStorageService } from './indexed-storage.service';

@Injectable({ providedIn: 'root'})
export class SourceFileService {
  constructor(
    private readonly fileStorageService: FilesRepositoryService,
    private readonly sanitizer: DomSanitizer,
    private readonly indexedStorageService: IndexedStorageService ) {

  }

  showXpsDocumentAsync(file: IFile, scale: number, cancel: Subject<any>, images: Array<SafeUrl>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fileStorageService.getDocumentPagesCount(file.body.id, file.body.size, scale)
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe(async count => {
            for (let i = 0; i < count; i++) {
              const page = await this.getPageAsync(file.body.id, i, cancel);
              images.push(page);
              resolve();
            }

            resolve();
          },
        e => reject(e));
    });
  }

  async getImageFileToShowAsync(file: IFile, cancel: Subject<any>): Promise<SafeUrl> {
    var imageType = this.getImageDataType(file.name);
    const result = await this.getImageFromLocalStorage(file.body.id, imageType);
    if (result.result)
      return result.promise;

    return new Promise((resolve, reject) => {

      if (imageType) {

        this.fileStorageService.getFile(file.body.id, file.body.size)
          .pipe(takeUntil(cancel))
          .subscribe(bytes => {
            var base64 = Tools.arrayBufferToBase64(bytes);
            this.setImageToLocalStorage(file.body.id, base64);
            var url = Tools.getImage(base64, imageType, this.sanitizer);
            resolve(url);
          }, err => reject(err));
      }
    });
  }

  async getThumbnailFileToShowAsync(file: IFile, cancel: Subject<any>): Promise<SafeUrl> {

    const result = await this.getImageFromLocalStorage(file.body.id, '.png');
    if (result.result)
      return result.promise;

    return new Promise((resolve, reject) => {
        this.fileStorageService.getFile(file.body.id, file.body.size)
          .pipe(takeUntil(cancel))
          .subscribe(bytes => {
            var base64 = Tools.arrayBufferToBase64(bytes);
            this.setImageToLocalStorage(file.body.id, base64);
            var url = Tools.getImage(base64, '.png', this.sanitizer);
            resolve(url);
          }, err => reject(err));
    });
  }

  async getXpsThumbnailAsync(file: IFile, cancel: Subject<any>): Promise<SafeUrl> {
    const result = await this.getImageFromLocalStorage(file.body.id, '.png');
    if (result.result)
      return result.promise;

    return new Promise((resolve, reject) => {
      this.fileStorageService.getThumbnail(file.body.id, file.body.size)
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe(bytes => {
          var base64 = Tools.arrayBufferToBase64(bytes);
          this.setImageToLocalStorage(file.body.id, base64);
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
    //const key = fileId + "_page" + page;
    //const result = await this.getImageFromLocalStorage(key, '.png');
    //if (result.result)
    //  return result.promise;

    return new Promise((resolve, reject) => {
      this.fileStorageService.getDocumentPageContent(fileId, page)
        .pipe(first())
        .pipe(takeUntil(cancel))
        .subscribe(page => {
          var base64 = Tools.arrayBufferToBase64(page);
          //this.setImageToLocalStorage(key, base64);
          var image = Tools.getImage(base64, ".png", this.sanitizer);
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

  private async getImageFromLocalStorage(key:string, imageType: string): Promise<LocalStorageResult> {
    let result = false;
    let promise = null;

    var localBase64 = await this.indexedStorageService.getImageFile(key);
    if (localBase64) {
      result = true;
      promise = new Promise(resolve => {
        var url = Tools.getImage(localBase64, imageType, this.sanitizer);
        resolve(url);
      });
    }

    return new LocalStorageResult(result, promise);
  }

  private setImageToLocalStorage(key: string, value: string): void {
    this.indexedStorageService.setImageFile(key, value);
  }
}

class LocalStorageResult {
  constructor(public result: boolean, public promise: Promise<SafeUrl>) {

  }
}
