import { HttpErrorResponse } from '@angular/common/http';
import { XmlParser, Element } from '@angular/compiler';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { first } from 'rxjs/operators';
import { IObject } from 'src/app/core/data/data.classes';
import { FilesRepositoryService } from 'src/app/core/files-repository.service';
import { RepositoryService } from 'src/app/core/repository.service';
import { FilesSelector } from 'src/app/core/tools/files.selector';
import { Remark } from './remark';
import { RemarkParser } from './remark.parser';

@Component({
  selector: 'app-remarks',
  templateUrl: './remarks.component.html',
  styleUrls: ['./remarks.component.css']
})
export class RemarksComponent implements OnInit {
    
  private _document: IObject;

  remarks: Array<Remark>;
  isLoading: boolean;

  constructor(private repository: RepositoryService,
    private fileRepository: FilesRepositoryService) { 
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

  ngOnInit(): void {
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
  }
}
