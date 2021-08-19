import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IFileSnapshot, IObject } from 'src/app/core/data/data.classes';
import { Remark } from '../components/remarks/remark';
import { RemarksLoaderFactory } from './remarks-loader.factory';

@Injectable({ providedIn: 'root'})
export class RemarksService {

  private _remarksVisibleName = "reamrks_visible";
  private _remarksSubject = new BehaviorSubject<Remark[]>(new Array());
  private _remarksVisibilitySubject = new BehaviorSubject<boolean>(false);
  private _selectedRemark = new BehaviorSubject<Remark>(null); 

  remarks = this._remarksSubject.asObservable();
  remarksVisibility = this._remarksVisibilitySubject.asObservable();
  selectedRemark = this._selectedRemark.asObservable();

  constructor(private readonly remarksLoaderFactory: RemarksLoaderFactory) {

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

  async loadRemarks(document: IObject, snapshot: IFileSnapshot): Promise<void> {

    let remarks = this.getRemarks();
    let loader = this.remarksLoaderFactory.createLoader();
    await loader.loadRemarks(document, snapshot, remarks);
    this.changeRemarkList(remarks);    
  }
}