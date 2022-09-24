import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

import { environment } from './../../environments/environment';
import { LoginRequest } from './login-request';
import { LoginResult } from './login-result';
import { RegisterRequest } from './register-request';
import { RegisterResult } from './register-result';
import { User } from './user';
import { DupeEmailRequest } from './dupe-email-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey: string = "token";  // localStorage token's key
  private nameKey: string = "name"; // localStorage user name's key
  private adminKey: string = "Administrator"; // localStorage

  private _authStatus = new Subject<boolean>();
  public authStatus = this._authStatus.asObservable();

  private _displayName = new Subject<string>();
  public displayName = this._displayName.asObservable();

  private _administrator = new Subject<boolean>();
  public administrator = this._administrator.asObservable();

  constructor(protected http: HttpClient) {
  }

  /** Returns whether the user has the administrator role via checking local storage. */
  isAdministrator(): boolean {
    return localStorage.getItem(this.adminKey) ? true : false;
  }

  /** Determines authentication status via checking local storage for a token. */
  isAuthenticated(): boolean {
    return this.getToken() != null;
  }

  /** Returns the token from local storage or returns null. */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Returns the users' name from local storage or returns an empty string. */
  getUserName(): string {
    var userName = localStorage.getItem(this.nameKey);
    return userName ? userName : "";
  }

  /** Called in app.component ngOnInit() */
  init(): void {
    if (this.isAuthenticated()) {
      this.setAuthStatus(true);
      this.setName(this.getUserName());
      if (this.isAdministrator())
        this.setAdministrator(true);
    }
  }

  /**
   * Sends a http post to the Login API.
   * @param item
   */
  login(item: LoginRequest): Observable<LoginResult> {
    var url = environment.baseUrl + 'api/Users/Login';
    return this.http.post<LoginResult>(url, item)
      .pipe(tap(loginResult => {
        if (loginResult.success && loginResult.token && loginResult.user.name) {

          localStorage.setItem(this.nameKey, loginResult.user.name);
          this.setName(loginResult.user.name);

          localStorage.setItem(this.tokenKey, loginResult.token);
          this.setAuthStatus(true);

          if (loginResult.user.roles.find(x => x == this.adminKey)) {
            localStorage.setItem(this.adminKey, this.adminKey);
            this.setAdministrator(true);
          }
        }
      }));
  }

  /** Removes items from local storage and resets Subject values */
  logout() {
    localStorage.removeItem(this.nameKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.adminKey)
    this.setAuthStatus(false);
    this.setName("");
    this.setAdministrator(false);
  }

  /**
   * Sets the authStatus Subject.next
   * @param isAuthenticated
   */
  private setAuthStatus(isAuthenticated: boolean): void {
    this._authStatus.next(isAuthenticated);
  }
  /**
   * Sets the displayName Subject.next
   * @param name
   */
  private setName(name: string): void {
    this._displayName.next(name);
  }

  /**
   * Sets the administrator Subject.next
   * @param isAdministrator
   */
  private setAdministrator(isAdministrator: boolean): void {
    this._administrator.next(isAdministrator);
  }

  /**
   * Sends http post to the Register API.
   * @param item
   */
  register(item: RegisterRequest): Observable<RegisterResult> {
    var url = this.getUrl("api/Users/Register");
    return this.http.post<RegisterResult>(url, item);
  }

  /**
   * Send http post to the IsDupeEmail API.
   * @param email
   */
  isDupeEmail(email: string): Observable<boolean> {
    var url = this.getUrl("api/Users/IsDupeEmail");
    var de = <DupeEmailRequest> { email: email };
    return this.http.post<boolean>(url, de);
  }

  private getUrl(url: string) {
    return environment.baseUrl + url;
  }

}
