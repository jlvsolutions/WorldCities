import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '@app/_services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // get the auth token
    var token = this.authService.getToken();

    // if the token is present, clone the request
    // replacing the original headers with the authorization
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` // Back Ticks !!!
        }
      });
    }

    // send the request to the next handler
    return next.handle(req).pipe(
      catchError((error) => {
        // Perform Logout on 401 - Unauthorized HTTP response errors
        if (error instanceof HttpErrorResponse && error.status === 401) {

          // TODO:  Crude handling if timeout.  Refresh Token mechanism (better, complex) should be implemented.
          this.authService.logout(); 
          this.router.navigate(['login']);  // Not sure this is best user experience at this stage of dev.
        }
        return throwError(error);
      })
    );
  }
}
