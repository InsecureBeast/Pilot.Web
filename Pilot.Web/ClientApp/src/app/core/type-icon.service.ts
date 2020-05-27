import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { skipWhile, first } from 'rxjs/operators';

import { SourceFileService } from './source-file.service';
import { IObject } from './data/data.classes';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { NodeStyle, NodeStyleService } from './node-style.service';
import { FilesSelector } from './tools/files.selector';
import { Tools } from './tools/tools';


export class PendingRequest {
  item: IObject;
  subscription: Subject<SafeUrl>;
  cancel: Subject<any>;

  constructor(item: IObject, subscription: Subject<SafeUrl>, cancel: Subject<any>) {
    this.item = item;
    this.cancel = cancel;
    this.subscription = subscription;
  }
}

@Injectable({ providedIn: 'root' })
export class TypeIconService {

  private requests$ = new Subject<any>();
  private queue: PendingRequest[] = [];

  constructor(
    private readonly nodeStyleService: NodeStyleService,
    private readonly sanitizer: DomSanitizer,
    private readonly sourceFileService: SourceFileService) {

    this.requests$.subscribe(request => this.execute(request));
  }

  /** Call this method to add your http request to queue */
  getPreview(item: IObject, cancel: Subject<any>): Subject<SafeUrl> {
    const sub = new Subject<any>();
    const request = new PendingRequest(item, sub, cancel);

    this.queue.push(request);
    request.cancel.pipe(first()).subscribe(value => {
      this.queue = [];
    });

    if (this.queue.length === 1) {
      this.startNextRequest();
    }
    return sub;
  }

  getTypeIcon(item: IObject): SafeUrl {
    if (!item)
      return null;

    const typeIcon = item.type.icon;
    if (typeIcon === null) {
      return null;
    }

    return Tools.getImage(typeIcon, "svg+xml;charset=utf-8", this.sanitizer);
  }

  private getPreviewAsync(item: IObject, cancel: Subject<any>): Promise<SafeUrl> {

    if (this.nodeStyleService.currentNodeStyle === NodeStyle.GridView) {
      if (this.sourceFileService.isXpsFile(item.actualFileSnapshot)) {
        const xpsfile = FilesSelector.getXpsFile(item.actualFileSnapshot.files);
        return this.sourceFileService.getXpsThumbnailAsync(xpsfile, cancel);
      }

      if (this.sourceFileService.isSvgFile(item.actualFileSnapshot)) {
        const imageFile = FilesSelector.getSourceFile(item.actualFileSnapshot.files);
        return this.sourceFileService.getImageFileToShowAsync(imageFile, cancel);
      }

      if (this.sourceFileService.isImageFile(item.actualFileSnapshot)) {
        let imageFile = FilesSelector.getSourceThumbnailFile(item.actualFileSnapshot.files);
        if (imageFile) {
          return this.sourceFileService.getThumbnailFileToShowAsync(imageFile, cancel);
        }

        imageFile = FilesSelector.getSourceFile(item.actualFileSnapshot.files);
        return this.sourceFileService.getImageFileToShowAsync(imageFile, cancel);
      }
    }

    return new Promise((resolve, reject) => {
      resolve(null);
    });
  }

  private execute(requestData: PendingRequest) {
    //One can enhance below method to fire post/put as well.
    this.getPreviewAsync(requestData.item, requestData.cancel)
      .then(res => {
        const sub = requestData.subscription;
        sub.next(res);
        this.queue.shift();
        this.startNextRequest();
      });
  }

  private startNextRequest() {
    // get next request, if any.
    if (this.queue.length > 0) {
      const request = this.queue[0];
      this.execute(request);
    }
  }
}
