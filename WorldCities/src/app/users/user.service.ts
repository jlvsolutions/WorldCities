import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService, ApiResult } from '../base.service';
import { Observable } from 'rxjs';

import { User } from './../auth/user';
import { UserResult } from './user-result';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService<User, string> {

  constructor(http: HttpClient) {
    super(http);
  }

  getData(
    pageIndex: number,
    pageSize: number,
    sortColumn: string,
    sortOrder: string,
    filterColumn: string | null,
    filterQuery: string | null): Observable<ApiResult<User>> {

    var url = this.getUrl("api/Account");
    var params = new HttpParams()
      .set("pageIndex", pageIndex.toString())
      .set("pageSize", pageSize.toString())
      .set("sortColumn", sortColumn)
      .set("sortOrder", sortOrder);

    if (filterColumn && filterQuery) {
      params = params
        .set("filterColumn", filterColumn)
        .set("filterQuery", filterQuery);
    }

    return this.http.get<ApiResult<User>>(url, { params });
  }

  get(id: string): Observable<User> {
    var url = this.getUrl("api/Account/" + id);
    return this.http.get<User>(url);
  }

  put(user: User): Observable<User> {
    // In my debugging, I discovered the API controller
    // REQIRES the id, email, name and roles fields to be included in the call.
    user.id = user.id ?? "";
    user.email = user.email ?? "";
    user.name = user.name ?? "";
    user.newPassword = user.newPassword ?? "";
    user.roles = user.roles ?? [""];

    var url = this.getUrl("api/Account/" + user.id);
    return this.http.put<User>(url, user);

  }

  post(item: User): Observable<User> {
    var url = this.getUrl("api/Account/");
    return this.http.post<User>(url, item);
  }

  getRoles(): Observable<string[]> {
    var url = this.getUrl("api/Account/GetRoles");
    return this.http.get<string[]>(url);
  }
}
