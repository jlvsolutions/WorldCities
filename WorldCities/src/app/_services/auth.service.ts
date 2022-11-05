import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, tap, map } from 'rxjs';

import { environment } from '@environments/environment';
import { User, LoginRequest, RegisterRequest, RevokeTokenRequest, DupeEmailRequest } from '@app/_models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /** The name of the Administrator role */
  private readonly _adminRoleName: string = "Administrator";

  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;


  //
  // Ctor
  constructor(protected http: HttpClient, router: Router) {
    this.userSubject = new BehaviorSubject<User>(null!);
    this.user = this.userSubject.asObservable();
  }

  /** Allows access to the current user without having to subscribe to the user observable. */
  public get userValue(): User {
    return this.userSubject.value;
  }

  /** Returns whether the user has the administrator role. */
  public isAdministrator(): boolean {
    return (this.userValue !== null) && this.userValue.roles.includes(this._adminRoleName);
  }

  /** Determines authentication status. */
  public isAuthenticated(): boolean {
    return (this.userValue !== null) && (this.userValue.jwtToken !== null);
  }

  public userName(): string {
    return (this.userValue !== null) ? this.userValue.name : "";
  }

  /** Returns the JWT token. */
  getToken(): string | null {
    return this.userValue.jwtToken ?? null;
  }

  /** Sends a http post to the Login API. */
  login(item: LoginRequest): Observable<User> {
    var url = this.getUrl('api/Users/Login');
    return this.http.post<User>(url, item)
      .pipe(tap(user => {
        this.userSubject.next(user);
        if (user) {
          console.log(`AuthService:  Login success, starting new timer for ${user.email}.`);
          this.startRefreshTokenTimer();
        }
      }, error => {
        console.log('AuthService:  Login failed.');
        console.error(error.error);
      }));
  }

  /** Sends http post to the Register API. */
  register(item: RegisterRequest): Observable<any> {
    var url = this.getUrl('api/Users/Register');
    return this.http.post<any>(url, item);
  }

  /** Sends a refresh-token request to the back end api */
  refreshToken() {
    var url = this.getUrl('api/Users/refresh-token');
    return this.http.post<User>(url, {}, { withCredentials: true })
      .pipe(tap(user => {
        this.userSubject.next(user);
        if (user) {
          console.log(`AuthService:  Refresh Token, starting new timer for ${user.email}.`)
          this.startRefreshTokenTimer();
        }
      }, error => {
        console.log('AuthService:  Refresh Token failed.');
        console.error(error.error);
      }));
  }

  /** Send http post to the IsDupeEmail API. */
  isDupeEmail(email: string): Observable<boolean> {
    var url = this.getUrl('api/Users/IsDupeEmail');
    var dupEmail = <DupeEmailRequest>{ email: email };
    return this.http.post<boolean>(url, dupEmail);
  }

  /** Sends revoke-token request and stops the refresh token timer. */
  logout() {
    var url = this.getUrl('api/Users/revoke-token');
    var req = <RevokeTokenRequest>{ token: null };
    this.http.post<any>(url, req, { withCredentials: true })
      .subscribe(msg => console.log(`AuthService: Logout, ${msg}`));
    this.userSubject.next(null!);
    this.stopRefreshTokenTimer();
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
