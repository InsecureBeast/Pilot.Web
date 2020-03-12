import { Injectable } from '@angular/core';
import { SourceFileService } from './source-file.service';
import { IObject } from './data/data.classes';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { NodeStyle, NodeStyleService } from './node-style.service';
import { FilesSelector } from './tools/files.selector';
import { ImagesService } from './tools/images.service';
import { Tools } from './tools/tools';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TypeIconService {
  constructor(private nodeStyleService: NodeStyleService, private sanitizer: DomSanitizer, private sourceFileService: SourceFileService) {

  }

  public getTypeIconAsync(item: IObject, cancel: Subject<any>): Promise<SafeUrl> {

    if (this.nodeStyleService.currentNodeStyle === NodeStyle.GridView) {
      if (this.sourceFileService.isXpsFile(item)) {
        var file = FilesSelector.getSourceFile(item.actualFileSnapshot.files);
        return this.sourceFileService.getXpsThumbnailAsync(file, cancel);
      }

      if (this.sourceFileService.isImageFile(item)) {
        var file = FilesSelector.getSourceFile(item.actualFileSnapshot.files);
        return this.sourceFileService.getImageFileToShowAsync(file, cancel);
      }
    }

    return new Promise((resolve, reject) => {
      var typeIcon = item.type.icon;
      if (typeIcon === null) {
        resolve(ImagesService.emptyDocumentIcon);
        return;
      }

      resolve(Tools.getImage(typeIcon, "svg+xml;charset=utf-8", this.sanitizer));
    });
  }
}
