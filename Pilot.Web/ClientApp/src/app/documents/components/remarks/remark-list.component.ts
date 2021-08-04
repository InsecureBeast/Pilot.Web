import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { first } from 'rxjs/operators';
import { IObject } from 'src/app/core/data/data.classes';
import { FilesRepositoryService } from 'src/app/core/files-repository.service';
import { RepositoryService } from 'src/app/core/repository.service';
import { FilesSelector } from 'src/app/core/tools/files.selector';
import { RemarksService } from '../../shared/remarks.service';
import { Remark, RemarkType } from './remark';
import { RemarkParser } from './remark.parser';

@Component({
  selector: 'app-remark-list',
  templateUrl: './remark-list.component.html',
  styleUrls: ['./remark-list.component.css']
})
export class RemarkListComponent implements OnInit {
    
  private _document: IObject;

  remarks: Array<Remark>;
  isLoading: boolean;

  constructor(
    private readonly repository: RepositoryService,
    private readonly fileRepository: FilesRepositoryService,
    private readonly remarksService: RemarksService) { 
      this.remarks = new Array();
    }

  @Input()
  get document(): IObject {
    return this._document;
  }
  set document(newValue: IObject) {
    this._document = newValue;
    if (newValue) {
      this.loadRemarks(newValue);
    }
  }

  @Output() error = new EventEmitter<HttpErrorResponse>();
  @Output() loaded = new EventEmitter<Remark[]>();

  ngOnInit(): void {
  }

  isRedPencil(remark: Remark): boolean {
    return remark.type === RemarkType.RED_PENCIL;
  }

  onClickRemark(remark: Remark, $event:Event): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.remarksService.changeSelectedRemark(remark);
  }

  private loadRemarks(document: IObject) {
    this.remarks = new Array<Remark>();
    this.isLoading = true;
    const snapshot = document.actualFileSnapshot;
    
    var remarkFiles = FilesSelector.getRemarkFiles(snapshot.files);
    
    remarkFiles.forEach(remark => {
      this.fileRepository.getFile(remark.body.id, remark.body.size).pipe(first()).subscribe(b => {
        const remark = RemarkParser.parseFromArrayBuffer(b);
        this.remarks.push(remark);
      });
    });
    
    this.isLoading = false;
    this.loaded.emit(this.remarks);
    this.remarksService.changeRemarkList(this.remarks);
  }
}
