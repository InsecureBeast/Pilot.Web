import { IFileSnapshot } from '../../../core/data/data.classes';
import { RepositoryService } from '../../../core/repository.service';
import { Tools } from '../../../core/tools/tools';
import { FilesSelector } from '../../../core/tools/files.selector';

export interface IDocumentVersion {
  creator: string;
  created: string;
  fileId: string;
  isSelected: boolean;
  snapshot: IFileSnapshot;
}

export class DocumentVersion implements IDocumentVersion {

  creator: string;
  created: string;
  fileId: string;
  isSelected: boolean;
  snapshot: IFileSnapshot;

  constructor(protected sourceSnapshot: IFileSnapshot, repository: RepositoryService) {

    this.created = Tools.toUtcCsDateTime(sourceSnapshot.created).toLocaleString();
    this.creator = '';
    const creator = repository.getPerson(sourceSnapshot.creatorId);
    if (creator) {
      this.creator = creator.displayName;
    }

    this.fileId = this.getFileId();
    this.snapshot = sourceSnapshot;
  }

  protected getFileId(): string {
    let file = FilesSelector.getXpsFile(this.sourceSnapshot.files);
    if (file == null) {
      file = FilesSelector.getPdfFile(this.sourceSnapshot.files);
    }

    if (file) {
      return file.body.id;
    }

    return '';
  }
}

export class FileVersion extends DocumentVersion implements IDocumentVersion {

  constructor(protected sourceSnapshot: IFileSnapshot, repository: RepositoryService) {
    super(sourceSnapshot, repository);
  }

  protected getFileId(): string {
    const file = FilesSelector.getSourceFile(this.sourceSnapshot.files);
    if (file) {
      return file.body.id;
    }

    return '';
  }
}
