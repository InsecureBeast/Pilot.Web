import { Injectable } from '@angular/core';

import { IPerson, IFileSnapshot } from '../../../core/data/data.classes';
import { RepositoryService } from '../../../core/repository.service';
import { Tools } from '../../../core/tools/tools';
import { FilesSelector } from '../../../core/tools/files.selector';

export interface IDocumentVersion {
  creator: IPerson;
  created: string;
  fileId: string;
  isSelected: boolean;
}

export class DocumentVersion implements IDocumentVersion {

  creator: IPerson;
  created: string;
  fileId: string;
  isSelected : boolean;

  constructor(protected readonly snapshot: IFileSnapshot, repository: RepositoryService) {

    this.created = Tools.toUtcCsDateTime(snapshot.created).toLocaleString();
    this.creator = repository.getPerson(snapshot.creatorId);
    this.fileId = this.getFileId();
  }

  protected getFileId(): string {
    
    let file = FilesSelector.getXpsFile(this.snapshot.files);
    if (file == null)
      file = FilesSelector.getPdfFile(this.snapshot.files);

    if (file)
      return file.body.id;

    return "";
  }
}

export class FileVersion extends DocumentVersion implements IDocumentVersion {

  constructor(protected readonly snapshot: IFileSnapshot, repository: RepositoryService) {
    super(snapshot, repository);
  }

  protected getFileId(): string {
    const file = FilesSelector.getSourceFile(this.snapshot.files);
    if (file)
      return file.body.id;

    return "";
  }
}
