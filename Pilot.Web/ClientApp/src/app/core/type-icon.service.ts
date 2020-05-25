import { Injectable } from '@angular/core';
import { SourceFileService } from './source-file.service';
import { IObject } from './data/data.classes';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { NodeStyle, NodeStyleService } from './node-style.service';
import { FilesSelector } from './tools/files.selector';
import { Tools } from './tools/tools';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TypeIconService {
  constructor(
    private readonly nodeStyleService: NodeStyleService,
    private readonly sanitizer: DomSanitizer,
    private readonly sourceFileService: SourceFileService) {

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

  getPreviewAsync(item: IObject, cancel: Subject<any>): Promise<SafeUrl> {

    if (this.nodeStyleService.currentNodeStyle === NodeStyle.GridView) {
      if (this.sourceFileService.isXpsFile(item.actualFileSnapshot)) {
        const xpsfile = FilesSelector.getXpsFile(item.actualFileSnapshot.files);
        return this.sourceFileService.getXpsThumbnailAsync(xpsfile, cancel);
      }

      //if (this.sourceFileService.isImageFile(item.actualFileSnapshot)) {
      //  const imageFile = FilesSelector.getSourceFile(item.actualFileSnapshot.files);
      //  return this.sourceFileService.getImageFileToShowAsync(imageFile, cancel);
      //}

      const imageFile = FilesSelector.getSourceThumbnailFile(item.actualFileSnapshot.files);
      if (imageFile)
        return this.sourceFileService.getThumbnailFileToShowAsync(imageFile, cancel);
    }


    return new Promise((resolve, reject) => {
      resolve(null);
    });
  }
}
