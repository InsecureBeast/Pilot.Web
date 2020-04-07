import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { INode } from '../../shared/node.interface';
import { IDocumentVersion, DocumentVersion } from './document.version';
import { RepositoryService } from '../../../core/repository.service';

@Component({
    selector: 'app-document-versions',
    templateUrl: './document-versions.component.html',
    styleUrls: ['./document-versions.component.css']
})
/** document-versions component*/
export class DocumentVersionsComponent implements OnChanges {

  @Input() document: INode;
  @Output() onVersionSelected = new EventEmitter<string>();

  versions : Array<IDocumentVersion>;

  /** document-versions ctor */
  constructor(private readonly repository: RepositoryService) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.versions = new Array();

    this.versions.push(new DocumentVersion(this.document.source.actualFileSnapshot, this.repository));
    for (let snapshot of this.document.source.previousFileSnapshots) {
      this.versions.push(new DocumentVersion(snapshot, this.repository));
    }
    
  }

  selected(version: IDocumentVersion): void {
    for (const v of this.versions) {
      v.isSelected = false;
    }

    version.isSelected = true;
    this.onVersionSelected.emit(version.fileId);
  }}
