import { ErrorHandlerService } from 'src/app/components/error/error-handler.service';

export function runWithHandleErrorAsync<T>(promise: Promise<T>, errorHandlerService: ErrorHandlerService) {

  const pr = promise.catch(err => errorHandlerService.handleErrorMessage(err)).then(data => data);
  return pr[''];
}

