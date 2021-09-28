import { HttpErrorResponse } from '@angular/common/http';
import { Component, 
  Input, 
  OnDestroy, 
  OnInit, 
  Output, 
  EventEmitter, 
  ElementRef, 
  ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Constants } from 'src/app/core/constants';
import { IFileSnapshot } from 'src/app/core/data/data.classes';
import { RepositoryService } from 'src/app/core/repository.service';
import { SourceFileService } from 'src/app/core/source-file.service';
import { FilesSelector } from 'src/app/core/tools/files.selector';
import { Tools } from 'src/app/core/tools/tools';
import { RemarksService } from '../../shared/remarks.service';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css']
})
export class DocumentViewerComponent implements OnInit, OnDestroy {
  
  private ngUnsubscribe = new Subject<void>();
  private remarksSubscription: Subscription;
  private selectedRemarksSubscription: Subscription;
  private scrollSubscription: Subscription;

  pages: string[];
  isLoading: boolean;
  error: HttpErrorResponse; //TODO event

  selectedVersionCreated: string;
  selectedVersionCreator: string;
  
  @Input()
  set snapshot(value: IFileSnapshot) {
    if (value) {
      this.loadSnapshot(value);
    }
  }

  @Input() isActualVersionSelected : boolean;

  @Output() downloaded = new EventEmitter<any>();
  @Output() versionSelected = new EventEmitter<any>();

  @ViewChild("viewer") viewer : ElementRef;

  constructor(
    private readonly remarksService: RemarksService,
    private readonly repository: RepositoryService,
    private readonly sourceFileService: SourceFileService) {

    this.pages = new Array();
    this.scrollSubscription = this.remarksService.selectedRemark.subscribe(remark => {
      if (this.viewer && remark && remarksService.getRemarksVisibility()) {
        let el = document.getElementById(remark.id + '-clickArea');
        el.scrollIntoView({
          block: "start",
          inline: "center"
        });
        this.viewer.nativeElement.scrollTop -= 50;
      }
    })
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }

    this.remarksSubscription?.unsubscribe();
    this.selectedRemarksSubscription?.unsubscribe();
    this.scrollSubscription?.unsubscribe();
  }

  download($event): void {
    this.downloaded.emit($event);
  }

  selectActualVersion() : boolean {
    this.versionSelected.emit();
    return false;
  }

  private loadSnapshot(snapshot: IFileSnapshot): void {
    this.isLoading = true;
    this.pages = new Array<string>();

    this.checkActualVersion(snapshot);

    if (this.sourceFileService.isXpsFile(snapshot)) {
      const file = FilesSelector.getSourceFile(snapshot.files);
      this.sourceFileService.fillUnsafeXpsDocumentPagesAsync(file, Constants.defaultDocumentScale, this.ngUnsubscribe, this.pages)
        .then(_ => this.isLoading = false)
        .catch(e => {
          this.isLoading = false;
          this.pages = null;
          this.error = e;
        });
      return;
    }

    if (this.sourceFileService.isImageFile(snapshot)) {
      const file = FilesSelector.getSourceFile(snapshot.files);
      if (!file) {
        this.isLoading = false;
        this.pages = null;
        return;
      }

      this.sourceFileService.getUnsafeImageFileToShowAsync(file, this.ngUnsubscribe)
      .then(url => {
        this.pages.push(url);
        this.isLoading = false;
      })
      .catch(e => {
        this.pages = null;
        this.error = e;
      });
      return;
    }

    if (this.sourceFileService.isKnownFile(snapshot)) {
      this.sourceFileService.openFileAsync(snapshot, this.ngUnsubscribe)
        .then(() => {
          this.isLoading = false;
        })
        .catch(e => {
          this.pages = null;
          this.error = e;
        });
      return;
    }

    this.pages = null;
    this.isLoading = false;
  }

  private checkActualVersion(snapshot: IFileSnapshot) {
    if (snapshot) {
      this.selectedVersionCreated = Tools.toUtcCsDateTime(snapshot.created).toLocaleString();
      this.selectedVersionCreator = '';
      const creator = this.repository.getPerson(snapshot.creatorId);
      if (creator) {
        this.selectedVersionCreator = creator.displayName;
      }
    }
  }
}
