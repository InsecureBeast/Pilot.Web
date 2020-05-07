import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { Subscription } from 'rxjs';

import { IDocumentVersion, DocumentVersion, FileVersion } from './document.version';
import { RepositoryService } from '../../../core/repository.service';
import { VersionsSelectorService } from './versions-selector.service';
import { IFileSnapshot, IObject } from '../../../core/data/data.classes';
import { TypeExtensions } from '../../../core/tools/type.extensions';

@Component({
    selector: 'app-document-versions',
    templateUrl: './document-versions.component.html',
    styleUrls: ['./document-versions.component.css']
})
/** document-versions component*/
export class DocumentVersionsComponent implements OnChanges, OnInit, OnDestroy {
  private versionSubscription: Subscription;
  private _document: IObject;

  @Input()
  get document(): IObject {
    return this._document;
  }
  set document(newValue: IObject) {
    this._document = newValue;
    this.loadVersions(newValue);
  }

  versions : Array<IDocumentVersion>;

  /** document-versions ctor */
  constructor(private repository: RepositoryService,
              private versionSelector: VersionsSelectorService) {
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

  private loadVersions(document: IObject): void {
    this.versions = new Array();
    for (let snapshot of document.previousFileSnapshots) {
      let version: IDocumentVersion;
      if (!TypeExtensions.isProjectFileOrFolder(document.type))
        version = new DocumentVersion(snapshot, this.repository);
      else {
        version = new FileVersion(snapshot, this.repository);
      }
      version.isSelected = false;
      this.versions.push(version);
    }

    const actualVersion = new DocumentVersion(document.actualFileSnapshot, this.repository);
    actualVersion.isSelected = true;
    this.versions.push(actualVersion);
    this.versions.reverse();
  }
}

