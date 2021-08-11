import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IFileSnapshot } from 'src/app/core/data/data.classes';
import { FilesRepositoryService } from 'src/app/core/files-repository.service';
import { DateTools } from 'src/app/core/tools/date.tools';
import { FilesSelector } from 'src/app/core/tools/files.selector';
import { Remark } from '../components/remarks/remark';
import { RemarkParser } from '../components/remarks/remark.parser';

@Injectable({ providedIn: 'root'})
export class RemarksService {

  private _remarksVisibleName = "reamrks_visible";
  private _remarksSubject = new BehaviorSubject<Remark[]>(new Array());
  private _remarksVisibilitySubject = new BehaviorSubject<boolean>(false);
  private _selectedRemark = new BehaviorSubject<Remark>(null); 

  remarks = this._remarksSubject.asObservable();
  remarksVisibility = this._remarksVisibilitySubject.asObservable();
  selectedRemark = this._selectedRemark.asObservable();

  constructor(private readonly fileRepository: FilesRepositoryService) {
    const isRemarksVisible = localStorage.getItem(this._remarksVisibleName);
    if (isRemarksVisible && isRemarksVisible === "1") {
        this._remarksVisibilitySubject.next(true);
    } else {
      this._remarksVisibilitySubject.next(false);
    }
  }

  changeRemarkList(remarks: Remark[]) : void {
      this._remarksSubject.next(remarks);
  }

  changeRemarksVisibility(value: boolean): void {
    this._remarksVisibilitySubject.next(value);
    if (value) {
      localStorage.setItem(this._remarksVisibleName, "1");
    } else {
      localStorage.setItem(this._remarksVisibleName, "0");
    }
  }

  changeSelectedRemark(remark: Remark): void {
    remark.isOpen = true;
    this._selectedRemark.next(remark);
  }

  getRemarksVisibility(): boolean {
    return this._remarksVisibilitySubject.value;
  }

  getRemarks(): Remark[] {
    return this._remarksSubject.value;
  }

  async loadRemarks(snapshot: IFileSnapshot): Promise<void> {
    let remarks = this.getRemarks();
    remarks.length = 0;
    var remarkFiles = FilesSelector.getRemarkFiles(snapshot.files);
    
    for (const file of remarkFiles) {
      var b = await this.fileRepository.getFileAsync(file.body.id, file.body.size);
      const remark = RemarkParser.parseFromArrayBuffer(b);
      remarks.push(remark);
    }

    this.changeRemarkList(remarks);    
  }
}