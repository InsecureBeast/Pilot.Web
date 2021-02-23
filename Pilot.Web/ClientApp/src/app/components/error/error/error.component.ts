import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../error-handler.service';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.css']
})
/** error component*/
export class ErrorComponent implements OnInit, OnChanges {

  @Input()
  response: HttpErrorResponse;

  code: number;
  message: string;

  /** error ctor */
  constructor(private errorService: ErrorHandlerService) {

  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    this.code = this.response.status;
    this.message = this.errorService.handleErrorMessage(this.response);
  }

  refresh(): void {
    window.location.reload();
  }
}
