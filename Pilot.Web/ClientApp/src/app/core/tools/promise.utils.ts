import { ErrorHandlerService } from "../../ui/error/error-handler.service";

export function runWithHandleErrorAsync<T>(promise: Promise<T>, errorHandlerService: ErrorHandlerService) {

  let error: string;
  let data: T;

  var pr = promise.catch(err => errorHandlerService.handleErrorMessage(err)).then(data => { return data; });
  return pr[''];
}

