import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IFileSnapshot } from 'src/app/core/data/data.classes';
import { RemarksService } from '../../shared/remarks.service';
import { Remark, RemarkType } from './remark';

@Component({
  selector: 'app-remark-list',
  templateUrl: './remark-list.component.html',
  styleUrls: ['./remark-list.component.css']
})
export class RemarkListComponent implements OnInit, OnDestroy{
    
  private remarksSubscription: Subscription;
  private _snapshot: IFileSnapshot;

  remarks: Array<Remark>;
  isLoading: boolean;

  constructor(private readonly remarksService: RemarksService) { 
      this.remarks = new Array();
    }
  
  @Input()
  get snapshot(): IFileSnapshot {
    return this._snapshot;
  }
  set snapshot(newValue: IFileSnapshot) {
    this._snapshot = newValue;
    if (newValue) {
      this.loadRemarks(newValue);
    }
  }
  @Input() needReload: boolean = true;

  @Output() error = new EventEmitter<HttpErrorResponse>();
  @Output() loaded = new EventEmitter<Remark[]>();

  ngOnInit(): void {
    this.remarksSubscription = this.remarksService.remarks.subscribe(remarks => {
      this.remarks = remarks;
      this.isLoading = false;
      this.loaded.emit(this.remarks);
    })
  }

  ngOnDestroy(): void {
    this.remarksSubscription?.unsubscribe();
  }

  isRedPencil(remark: Remark): boolean {
    return remark.type === RemarkType.RED_PENCIL;
  }

  onClickRemark(remark: Remark, $event:Event): boolean {
    $event.preventDefault();
    $event.stopPropagation();
    this.remarksService.changeSelectedRemark(remark);
    return false;
  }

  private loadRemarks(snapshot: IFileSnapshot) {
    if (!this.needReload) {
      const loadedRemarks = this.remarksService.getRemarks();
      this.remarks = loadedRemarks;
      return;
    }

    this.isLoading = true;
    this.remarksService.loadRemarks(snapshot)
  }
}
