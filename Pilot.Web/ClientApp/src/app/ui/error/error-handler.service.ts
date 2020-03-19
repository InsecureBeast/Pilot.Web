import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  constructor(private authService: AuthService,
    private readonly router: Router ) {

  }

  handleErrorMessage(e: HttpErrorResponse): string {

    if (e.status === 400) {
      if (e.error.errors)
        return JSON.stringify(e.error.errors);

      return e.error;
    }

    if (e.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return e.message;
    }

    if (e.status === 503)
      return e.error;

    return e.message;
  }
}

export class Error {
  param: string;
  error: string;
}
