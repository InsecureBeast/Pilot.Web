import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { first, skipWhile } from 'rxjs/operators';
import { Subscription } from 'rxjs';

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
export class AuthComponent implements OnInit, OnDestroy {
  private loginSubscription: Subscription;
  private errorSubscription: Subscription;

  username: string;
  password: string;
  error: string;
  isProcessing: boolean;

  /** auth ctor */
  constructor(
    private readonly repositoryService: RepositoryService,
    private readonly authService: AuthService,
    private readonly errorService: ErrorHandlerService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.error = null;
    this.isProcessing = false;
    this.errorSubscription = this.authService.error.subscribe(err => {
      this.isProcessing = false;
      if (!err) {
        this.error = err;
        return;
      }

      this.error = this.errorService.handleErrorMessage(err);
    });
   
  }

  ngOnDestroy(): void {
    if (this.loginSubscription)
      this.loginSubscription.unsubscribe();
    if (this.errorSubscription)
      this.errorSubscription.unsubscribe();
  }

  onEnter() {
    if (this.username && this.password)
      this.login();
  }

  login(): void {
    this.isProcessing = true;
    this.error = null;
    this.initialize();
    this.authService.login(this.username, this.password);
  }

  private initialize() : void {
    this.loginSubscription = this.authService.isLoggedIn.subscribe(value => {
      if (!value)
        return;

      this.repositoryService.initialize()
        .pipe(skipWhile(v => !v))
        .subscribe(isInit => {
          this.isProcessing = false;

          const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'];
          if (!returnUrl) {
            this.router.navigate(['/documents/' + SystemIds.rootId]);
            return;
          }
          this.router.navigate([returnUrl]);
        }, (e: HttpErrorResponse) => {
          this.isProcessing = false;
          this.error = this.errorService.handleErrorMessage(e);
          if (e.status === 401)
            this.error = null;
        });
    });
  }
}
