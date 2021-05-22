import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { NotificationService } from './notification.service';
import { ErrorHandlerService } from '../components/error/error-handler.service';

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler implements ErrorHandler {

  // Error handling is important and needs to be loaded first.
  // Because of this we should manually inject the services with Injector.
  constructor(private injector: Injector) { }

  handleError(error: Error | HttpErrorResponse) {
    const notifier = this.injector.get(NotificationService);
    const errorHandlerService = this.injector.get(ErrorHandlerService);

    if (error instanceof  HttpErrorResponse) {
      const response = error as HttpErrorResponse;
      const err = errorHandlerService.handleErrorMessage(response);
      if (err === null) {
        return;
      }

      console.error(err);
      notifier.showError(err);
      return;
    }

    if (error.rejection) {
      const err = errorHandlerService.handleErrorMessage(error.rejection);
      if (err === null) {
        return;
      }

      console.error(err);
      notifier.showError(err);
      return;
    }

    notifier.showError(error);
    console.error(error);
  }
}
