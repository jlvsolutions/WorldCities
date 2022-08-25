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
  private nameKey: string = "name"; // localStorage user name's key

  private _authStatus = new Subject<boolean>();
  public authStatus = this._authStatus.asObservable();

  private _displayName = new Subject<string>();
  public displayName = this._displayName.asObservable();

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
    var userName = localStorage.getItem(this.nameKey);
    return userName ? userName : "";
  }

  /** Called in app.component ngOnInit()
   */
  init(): void {
    if (this.isAuthenticated()) {
      this.setAuthStatus(true);
      this.setName(this.getUserName());
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
        if (loginResult.success && loginResult.token && loginResult.name) {

          localStorage.setItem(this.nameKey, loginResult.name);
          this.setName(loginResult.name);

          localStorage.setItem(this.tokenKey, loginResult.token);
          this.setAuthStatus(true);
        }
      }));
  }

  logout() {
    localStorage.removeItem(this.nameKey);
    localStorage.removeItem(this.tokenKey);
    this.setAuthStatus(false);
    this.setName("");
  }

  /** Sets the Subject.next */
  private setAuthStatus(isAuthenticated: boolean): void {
    this._authStatus.next(isAuthenticated);
  }

  private setName(name: string): void {
    this._displayName.next(name);
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
