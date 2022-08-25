import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

import { environment } from './../../environments/environment';
import { LoginRequest } from './login-request';
import { LoginResult } from './login-result';
import { RegisterRequest } from './register-request';
import { RegisterResult } from './register-result';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey: string = "token";  // localStorage token's key
  private userNameKey: string = "username"; // localStorage user name's key

  private _authStatus = new Subject<boolean>();
  public authStatus = this._authStatus.asObservable();

  private _userName = new Subject<string>();
  public userName = this._userName.asObservable();

  constructor(
    protected http: HttpClient) {
  }

  isAuthenticated(): boolean {
    return this.getToken() != null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserName(): string {
    var userName = localStorage.getItem(this.userNameKey);
    return userName ? userName : "";
  }

  /** Called in app.component ngOnInit()
   */
  init(): void {
    if (this.isAuthenticated()) {
      this.setAuthStatus(true);
      this.setUserName(this.getUserName());
    }
  }

  /**
   * Sends a http post to the Login API.
   * @param item
   */
  login(item: LoginRequest): Observable<LoginResult> {
    var url = environment.baseUrl + 'api/Account/Login';
    return this.http.post<LoginResult>(url, item)
      .pipe(tap(loginResult => {
        if (loginResult.success && loginResult.token && loginResult.userName) {

          localStorage.setItem(this.userNameKey, loginResult.userName);
          this.setUserName(loginResult.userName);

          localStorage.setItem(this.tokenKey, loginResult.token);
          this.setAuthStatus(true);
        }
      }));
  }

  logout() {
    localStorage.removeItem(this.userNameKey);
    localStorage.removeItem(this.tokenKey);
    this.setAuthStatus(false);
    this.setUserName("");
  }

  /** Sets the Subject.next */
  private setAuthStatus(isAuthenticated: boolean): void {
    this._authStatus.next(isAuthenticated);
  }

  private setUserName(userName: string): void {
    this._userName.next(userName);
  }

  /**
   * Sends http post to the Register API.
   * @param item
   */
  register(item: RegisterRequest): Observable<RegisterResult> {
    var url = this.getUrl("api/Account/Register");
    return this.http.post<RegisterResult>(url, item);
  }

  isDupeEmail(user: User): Observable<boolean> {
    var url = this.getUrl("api/Account/IsDupeEmail");
    return this.http.post<boolean>(url, user);
  }

  private getUrl(url: string) {
    return environment.baseUrl + url;
  }

}
