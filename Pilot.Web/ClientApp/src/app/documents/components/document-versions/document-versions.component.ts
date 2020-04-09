import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { Subscription } from 'rxjs';

import { INode } from '../../shared/node.interface';
import { IDocumentVersion, DocumentVersion, FileVersion } from './document.version';
import { RepositoryService } from '../../../core/repository.service';
import { VersionsSelectorService } from './versions-selector.service';
import { IFileSnapshot } from '../../../core/data/data.classes';

@Component({
    selector: 'app-document-versions',
    templateUrl: './document-versions.component.html',
    styleUrls: ['./document-versions.component.css']
})
/** document-versions component*/
export class DocumentVersionsComponent implements OnChanges, OnInit, OnDestroy {
  private versionSubscription: Subscription;
  private _document: INode;

  //@Input()
  //get selectedVersion(): string {
  //   return this._aSelectedVersion;
  //}
  //set selectedVersion(newValue: string) {
  //  if (!this.document)
  //    return;

  //  let snapshot = this.document.source.actualFileSnapshot;
  //  if (newValue !== "") {
  //    snapshot = this.document.source.previousFileSnapshots.find(f => f.created === this.selectedVersion);
  //  }

  //  this._aSelectedVersion = newValue;
  //  this.selectVersion(snapshot);
  //}

  @Input()
  get document(): INode {
    return this._document;
  }
  set document(newValue: INode) {
    this._document = newValue;
    this.loadVersions(newValue);
  }

  versions : Array<IDocumentVersion>;

  /** document-versions ctor */
  constructor(private readonly repository: RepositoryService,
              private readonly versionSelector: VersionsSelectorService) {
    this.versions = new Array();
  }

  ngOnInit(): void {
    this.versionSubscription = this.versionSelector.selectedSnapshot$.subscribe(s => {
      if (s === null)
        return;

      if (!this.document)
          return;

      this.selectVersion(s);
    });
  }

  ngOnDestroy(): void {
    this.versionSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  selected(version: IDocumentVersion): void {
    this.selectVersion(version.snapshot);
    this.versionSelector.changeSelectedSnapshot(version.snapshot);
  }

  private selectVersion(snapshot: IFileSnapshot): void {
    for (const v of this.versions) {
        v.isSelected = v.snapshot.created === snapshot.created;
    }
  }

  private loadVersions(document: INode): void {
    this.versions = new Array();
    for (let snapshot of document.source.previousFileSnapshots) {
      let version: IDocumentVersion;
      if (!document.isSource)
        version = new DocumentVersion(snapshot, this.repository);
      else {
        version = new FileVersion(snapshot, this.repository);
      }
      version.isSelected = false;
      this.versions.push(version);
    }

    const actualVersion = new DocumentVersion(document.source.actualFileSnapshot, this.repository);
    actualVersion.isSelected = true;
    this.versions.push(actualVersion);
    this.versions.reverse();
  }
}

