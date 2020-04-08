import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { INode } from '../../shared/node.interface';
import { IDocumentVersion, DocumentVersion, FileVersion } from './document.version';
import { RepositoryService } from '../../../core/repository.service';
import { IFileSnapshot } from '../../../core/data/data.classes';

@Component({
    selector: 'app-document-versions',
    templateUrl: './document-versions.component.html',
    styleUrls: ['./document-versions.component.css']
})
/** document-versions component*/
export class DocumentVersionsComponent implements OnChanges {

  @Input() document: INode;
  @Input() selectedVersion: IFileSnapshot;
  @Output() onVersionSelected = new EventEmitter<IFileSnapshot>();

  versions : Array<IDocumentVersion>;

  /** document-versions ctor */
  constructor(private readonly repository: RepositoryService) {

  }

  ngOnChanges(changes: SimpleChanges): void {

    this.versions = new Array();
    for (let snapshot of this.document.source.previousFileSnapshots) {
      let version: IDocumentVersion;
      if (!this.document.source)
        version = new DocumentVersion(snapshot, this.repository);
      else {
        version = new FileVersion(snapshot, this.repository);
      }
      version.isSelected = snapshot.created === this.selectedVersion.created;
      this.versions.push(version);
    }

    let actualVersion = new DocumentVersion(this.document.source.actualFileSnapshot, this.repository);
    actualVersion.isSelected = this.document.source.actualFileSnapshot.created === this.selectedVersion.created;
    this.versions.push(actualVersion);
    this.versions.reverse();
  }

  selected(version: IDocumentVersion): void {
    for (const v of this.versions) {
      v.isSelected = false;
    }

    version.isSelected = true;
    this.onVersionSelected.emit(version.snapshot);
  }}
