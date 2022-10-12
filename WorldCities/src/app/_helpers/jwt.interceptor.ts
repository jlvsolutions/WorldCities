import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '@app/_services/auth.service';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // get the auth token
    const loginResult = this.authService.userValue;
    const isLoggedIn = loginResult && loginResult.jwtToken;
    const isApiUrl = request.url.startsWith(environment.baseUrl);

    // if the token is present, clone the request
    // replacing the original headers with the authorization
    if (isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${loginResult.jwtToken}` }
      });
    }

    // send the request to the next handler
    return next.handle(request);
  }
}
