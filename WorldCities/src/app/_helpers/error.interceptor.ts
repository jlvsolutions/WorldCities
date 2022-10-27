import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '@app/_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request)
      .pipe(catchError((error) => {

        // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        if ([400, 403].includes(error.status) && this.authService.userValue) {
          this.authService.logout();
        }

        var errorToThrow = error.statusText;
        if (error.error)
          errorToThrow = errorToThrow + ", " + error.error;
        //const tError = (error && error.error && error.error.message) || error.statusText;
        console.log('ErrorInterceptor: error occurred.');
        console.error(error);
        return throwError(error);
      })
    );
  }
}
