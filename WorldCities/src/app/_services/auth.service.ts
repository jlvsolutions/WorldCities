import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, tap, map } from 'rxjs';

import { environment } from '@environments/environment';
import { LoginRequest } from '@app/auth/login-request';
import { LoginResult } from '@app/auth/login-result';
import { RegisterRequest } from '@app/auth/register-request';
import { RegisterResult } from '@app/auth/register-result';
import { DupeEmailRequest } from '@app/auth/dupe-email-request';
import { RevokeTokenRequest } from '@app/_models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey: string = "token";  // localStorage token's key
  private nameKey: string = "name"; // localStorage user name's key

  /** The name of the Administrator role */
  public readonly AdminRoleName: string = "Administrator";

  private userSubject: BehaviorSubject<LoginResult>;
  public user: Observable<LoginResult>;


  //
  // Ctor
  constructor(protected http: HttpClient, router: Router) {
    this.userSubject = new BehaviorSubject<LoginResult>(null!);
    this.user = this.userSubject.asObservable();
  }

  /** Allows access to the current user without having to subscribe to the user observable. */
  public get userValue(): LoginResult {
    return this.userSubject.value;
  }

  /** Returns whether the user has the administrator role. */
  public isAdministrator(): boolean {
    return (this.userValue !== null) && this.userValue.user?.roles?.includes(this.AdminRoleName);
  }

  /** Determines authentication status. */
  public isAuthenticated(): boolean {
    return (this.userValue !== null) && (this.userValue.jwtToken !== null);
  }

  public userName(): string {
    return (this.userValue !== null) ? this.userValue.user.name : "";
  }

  /** Returns the JWT token. */
  getToken(): string | null {
    return this.userValue.jwtToken ?? null;
  }

  /** Called in app.component ngOnInit() */
  init(): void {
  }

  /** Sends http post to the Register API.
   * @param item RegisterRequest
   */
  register(item: RegisterRequest): Observable<RegisterResult> {
    var url = this.getUrl("api/Users/Register");
    return this.http.post<RegisterResult>(url, item);
  }

  /** Sends a http post to the Login API.
   * @param item LoginRequest
   */
  login(item: LoginRequest): Observable<LoginResult> {
    var url = environment.baseUrl + 'api/Users/Login';
    return this.http.post<LoginResult>(url, item)
      .pipe(tap(loginResult => {
        this.userSubject.next(loginResult);
        if (loginResult.success) {
          console.log('login starting new timer.');
          this.startRefreshTokenTimer();
        } else
          console.log('login failed.');
      }));
  }

  /** Sends revoke-token request and stops the refresh token timer. */
  logout() {
    var url = environment.baseUrl + 'api/Users/revoke-token';
    var req = <RevokeTokenRequest> { token: null };
    this.http.post<any>(url, req, { withCredentials: true }).subscribe();
    this.userSubject.next(null!);
    this.stopRefreshTokenTimer();
  }

  /** Sends a refresh-token request to the back end api */
  refreshToken() {
    var url = environment.baseUrl + 'api/Users/refresh-token';
    return this.http.post<LoginResult>(url, {}, { withCredentials: true })
      .pipe(map((result) => {
        this.userSubject.next(result);
        if (result.success) {
          console.log('refreshToken starting new timer.')
          this.startRefreshTokenTimer();
        } else
          console.log('refreshToken failed.')
        return result;
      }));
  }

  /** Send http post to the IsDupeEmail API.
   * @param email Email to check
   */
  isDupeEmail(email: string): Observable<boolean> {
    var url = this.getUrl("api/Users/IsDupeEmail");
    var dupEmail = <DupeEmailRequest>{ email: email };
    return this.http.post<boolean>(url, dupEmail);
  }


  //
  // Helper Methods
  private refreshTokenTimeout: any;  //: NodeJS.Timeout | undefined;

  private startRefreshTokenTimer() {
    // parse json object from base64 encoded jwt token
    const jwtToken = JSON.parse(atob(this.userValue.jwtToken!.split('.')[1]));

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }

  private getUrl(url: string) {
    return environment.baseUrl + url;
  }

}
