import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class RemarksScrollPositionService {

    private _positionSubject = new BehaviorSubject<number>(0);

    position = this._positionSubject.asObservable();

    change(position: number): void {
        this._positionSubject.next(position);
    }
}