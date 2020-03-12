import { IFile } from "../data/data.classes";
import { FileNames } from "../data/file.names";

export class FilesSelector {

  public static getSourceFile(files: IFile[]): IFile {
    for (var file of files) {
      if (!this.isThumbnailFile(file))
        return file;
    }
    return null;
  }

  public static getSourceThumbnailFile(files: IFile[]): IFile {
    for (var file of files) {
      if (this.isThumbnailFile(file))
        return file;
    }
    return null;
  }

  private static isThumbnailFile(file: IFile): boolean {
    if (file.name.endsWith(FileNames.THUMBNAIL_FILE_NAME_POSTFIX))
      return true;

    return false;
  }
}
