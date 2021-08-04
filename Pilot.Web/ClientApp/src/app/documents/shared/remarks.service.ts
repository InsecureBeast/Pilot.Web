import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Remark } from '../components/remarks/remark';

@Injectable({ providedIn: 'root'})
export class RemarksService {

  private _remarksSubject = new BehaviorSubject<Remark[]>(new Array());
  private _remarksVisibilitySubject = new BehaviorSubject<boolean>(false);
  private _selectedRemark = new BehaviorSubject<Remark>(null); 

  remarks = this._remarksSubject.asObservable();
  remarksVisibility = this._remarksVisibilitySubject.asObservable();
  selectedRemark = this._selectedRemark.asObservable();

  constructor() {
    
  }

  changeRemarkList(remarks: Remark[]) : void {
      this._remarksSubject.next(remarks);
  }

  changeRemarksVisibility(value: boolean): void {
    this._remarksVisibilitySubject.next(value);
  }

  changeSelectedRemark(remark: Remark): void {
    this._selectedRemark.next(remark);
  }

  getRemarksVisibility(): boolean {
    return this._remarksVisibilitySubject.value;
  }
}