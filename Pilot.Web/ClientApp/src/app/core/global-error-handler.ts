import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {

  // Error handling is important and needs to be loaded first.
  // Because of this we should manually inject the services with Injector.
  constructor(private injector: Injector) { }

  handleError(error: Error | HttpErrorResponse) {
    const notifier = this.injector.get(NotificationService);

    notifier.showError(error);

    console.error(error);
  }
}
