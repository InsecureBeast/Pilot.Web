import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Remark } from '../components/remarks/remark';

@Injectable({ providedIn: 'root'})
export class RemarksService {

  private _remarksSubject = new BehaviorSubject<Remark[]>(new Array());
  private _remarksVisibilitySubject = new BehaviorSubject<boolean>(false);

  remarks = this._remarksSubject.asObservable();
  remarksVisibility = this._remarksVisibilitySubject.asObservable();

  constructor() {
    
  }

  changeRemarkList(remarks: Remark[]) : void {
      this._remarksSubject.next(remarks);
  }

  changeRemarksVisibility(value: boolean): void {
    this._remarksVisibilitySubject.next(value);
  }

  getRemarksVisibility(): boolean {
    return this._remarksVisibilitySubject.value;
  }
}