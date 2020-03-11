import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { ErrorHandlerService } from '../../ui/error/error-handler.service';
import { SystemIds } from '../../core/system.ids';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.css']
})
/** auth component*/
export class AuthComponent {

  username: string;
  password: string;
  error: string;
  isProcessing: boolean;


  /** auth ctor */
  constructor(private authService: AuthService,
    private errorService: ErrorHandlerService,
    private router: Router) {

  }

  onEnter() {
    if (this.username && this.password)
      this.login();
  }

  login(): void {
    this.isProcessing = true;
    this.error = null;

    this.authService.login(this.username, this.password).pipe(first()).subscribe(result => {
      //this.repositoryService.initialize();

      //this.subscription = this.repositoryService.initialized.subscribe(isInit => {
      //  if (isInit) {
      //    this.isProcessing = false;
      this.router.navigate(['/fetch-data']);// + SystemIds.rootId]);
      //  }
      //});

    }, (e: HttpErrorResponse) => {
      this.isProcessing = false;
      this.error = this.errorService.handleErrorMessage(e);
    });
  }
}
