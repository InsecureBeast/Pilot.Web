import { IFile } from '../data/data.classes';
import { FileNames } from '../data/file.names';

export class FilesSelector {

  static getSourceFile(files: IFile[]): IFile {
    if (!files) {
      return null;
    }
    for (const file of files) {
      if (!this.isThumbnailFile(file)) {
        return file;
      }
    }
    return null;
  }

  static getSourceThumbnailFile(files: IFile[]): IFile {
    for (const file of files) {
      if (this.isThumbnailFile(file)) {
        return file;
      }
    }
    return null;
  }

  static getXpsFile(files: IFile[]): IFile {
    for (const file of files) {
      if (this.isXpsFile(file)) {
        return file;
      }
    }
    return null;
  }

  static getPdfFile(files: IFile[]): IFile {
    for (const file of files) {
      if (this.isPdfFile(file)) {
        return file;
      }
    }
    return null;
  }

  static getSignatureFiles(files: IFile[]): IFile[] {
    const signatures = new Array<IFile>();
    for (const file of files) {
      if (this.isSignatureFile(file)) {
        signatures.push(file);
      }
    }
    return signatures;
  }

  static getRemarkFiles(files: IFile[]): IFile[] {
    const remarks = new Array<IFile>();
    for (const file of files) {
      if (this.isRemarkFile(file)) {
        remarks.push(file);
      }
    }
    return remarks;
  }

  static isXpsFile(file: IFile): boolean {
    return file.name.toLowerCase().endsWith(FileNames.XPS_FILE_NAME_POSTFIX);
  }

  static isPdfFile(file: IFile): boolean {
    return file.name.toLowerCase().endsWith(FileNames.PDF_FILE_NAME_POSTFIX);
  }

  static isThumbnailFile(file: IFile): boolean {
    return file.name.endsWith(FileNames.THUMBNAIL_FILE_NAME_POSTFIX);
  }

  static isSignatureFile(file: IFile): boolean {
    return file.name === FileNames.SIGNATURE_FILE_NAME;
  }

  static isRemarkFile(file: IFile): boolean {
    return file.name.startsWith(FileNames.REMARK_FILE_NAME);
  }
}
