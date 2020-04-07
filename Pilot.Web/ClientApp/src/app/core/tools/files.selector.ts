import { IFile } from "../data/data.classes";
import { FileNames } from "../data/file.names";

export class FilesSelector {

  static getSourceFile(files: IFile[]): IFile {
    for (let file of files) {
      if (!this.isThumbnailFile(file))
        return file;
    }
    return null;
  }

  static getSourceThumbnailFile(files: IFile[]): IFile {
    for (let file of files) {
      if (this.isThumbnailFile(file))
        return file;
    }
    return null;
  }

  static getXpsFile(files: IFile[]): IFile {
    for (let file of files) {
      if (this.isXpsFile(file))
        return file;
    }
    return null;
  }

  static getPdfFile(files: IFile[]): IFile {
    for (let file of files) {
      if (this.isPdfFile(file))
        return file;
    }
    return null;
  }

  static isXpsFile(file: IFile): boolean {
    return file.name.endsWith(FileNames.XPS_FILE_NAME_POSTFIX);
  }

  static isPdfFile(file: IFile): boolean {
    return file.name.endsWith(FileNames.PDF_FILE_NAME_POSTFIX);
  }

  static isThumbnailFile(file: IFile): boolean {
    return file.name.endsWith(FileNames.THUMBNAIL_FILE_NAME_POSTFIX);
  }
}
