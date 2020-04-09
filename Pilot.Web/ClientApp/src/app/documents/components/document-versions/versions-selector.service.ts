import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { IFileSnapshot } from '../../../core/data/data.classes';

@Injectable({ providedIn: 'root' })
export class VersionsSelectorService {

  private _selectedSnapshot$ = new BehaviorSubject<IFileSnapshot>(null);
  selectedSnapshot$ = this._selectedSnapshot$.asObservable();

  constructor() {

  }

  changeSelectedSnapshot(snapshot: IFileSnapshot) {
    this._selectedSnapshot$.next(snapshot);
  }
}
