import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Remark } from '../components/remarks/remark';

@Injectable({ providedIn: 'root'})
export class RemarksService {

  private remarksSubject = new BehaviorSubject<Remark[]>(new Array());
  remarks = this.remarksSubject.asObservable();

  constructor() {
    
  }

  changeRemarkList(remarks: Remark[]) : void {
      this.remarksSubject.next(remarks);
  }
}