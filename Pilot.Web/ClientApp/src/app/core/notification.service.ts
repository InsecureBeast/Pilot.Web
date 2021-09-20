import { Injectable, EventEmitter} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  onError = new EventEmitter<Error | HttpErrorResponse | string>();

  constructor() { }

  showError(error: Error | HttpErrorResponse | string): void {
    // The second parameter is the text in the button.
    // In the third, we send in the css class for the snack bar.
    this.onError.emit(error);
  }
}
