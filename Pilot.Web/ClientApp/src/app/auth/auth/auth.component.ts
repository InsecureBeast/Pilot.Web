import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { first, skipWhile } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { ErrorHandlerService } from '../../ui/error/error-handler.service';
import { SystemIds } from '../../core/data/system.ids';
import { RepositoryService } from '../../core/repository.service';

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
  constructor(
    private repositoryService: RepositoryService,
    private authService: AuthService,
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

    this.authService.login(this.username, this.password).pipe(first()).subscribe(async result => {
      this.repositoryService.initializeAsync().pipe(skipWhile(v => !v)).subscribe(isInit => {
          this.isProcessing = false;
          this.router.navigate(['/documents/' + SystemIds.rootId]);
      });
    }, (e: HttpErrorResponse) => {
      this.isProcessing = false;
      this.error = this.errorService.handleErrorMessage(e);
    });
  }
}
