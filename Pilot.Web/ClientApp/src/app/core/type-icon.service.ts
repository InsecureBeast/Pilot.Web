import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import { SourceFileService } from './source-file.service';
import { IObject } from './data/data.classes';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { NodeStyle, NodeStyleService } from './node-style.service';
import { FilesSelector } from './tools/files.selector';
import { Tools } from './tools/tools';
import { Queue } from './tools/queue';

@Injectable({ providedIn: 'root' })
export class TypeIconService {

  private queue: Queue<SafeUrl>;

  constructor(private readonly iconsProvider: TypeIconProvider) {
    this.queue = new Queue<SafeUrl>();
  }

  getPreview(item: IObject, cancel: Subject<any>): Observable<SafeUrl> {
    return this.queue.enqueue(() => this.iconsProvider.getPreviewAsync(item, cancel), cancel);
  }

  getTypeIcon(item: IObject): SafeUrl {
    return this.iconsProvider.getTypeIcon(item);
  }

  getSvgIcon(svgIcon: string): SafeUrl {
    return this.iconsProvider.getSvgIcon(svgIcon);
  }
}

@Injectable({ providedIn: 'root' })
export class TypeIconProvider {

  constructor(
    private readonly nodeStyleService: NodeStyleService,
    private readonly sanitizer: DomSanitizer,
    private readonly sourceFileService: SourceFileService) {
  }

  getTypeIcon(item: IObject): SafeUrl {
    if (!item) {
      return null;
    }

    const typeIcon = item.type.icon;
    if (!typeIcon) {
      return null;
    }
    return Tools.getImage(typeIcon, 'svg+xml;charset=utf-8', this.sanitizer);
  }

  getSvgIcon(svgIcon: string): SafeUrl {
    return Tools.getSvgImage(svgIcon, this.sanitizer);
  }

  getPreviewAsync(item: IObject, cancel: Subject<any>): Promise<SafeUrl> {
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

      // const preview = FilesSelector.getSourceThumbnailFile(item.actualFileSnapshot.files);
      // if (preview) {
      //   return this.sourceFileService.getThumbnailFileToShowAsync(preview, cancel);
      // }
    }

    return new Promise((resolve, reject) => {
      resolve(null);
    });
  }
}
