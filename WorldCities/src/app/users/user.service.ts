import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService, ApiResult } from '../base.service';
import { Observable } from 'rxjs';

import { User } from './../auth/user';

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

  put(item: User): Observable<User> {
    var url = this.getUrl("api/Account/" + item.id);
    return this.http.put<User>(url, item);

  }

  post(item: User): Observable<User> {
    var url = this.getUrl("api/Account/");
    return this.http.post<User>(url, item);
  }

  getRoles(): Observable<string[]> {
    var url = this.getUrl("api/Account/GetRoles");
    return this.http.get<string[]>(url);
  }

  isDupeEmail(item: User): Observable<boolean> {
    var url = this.getUrl("api/Account/IsDupeEmail");
    return this.http.post<boolean>(url, item);
  }

  isDupeEmailValue(email: string): Observable<boolean> {
    var url = this.getUrl("api/Account/IsDupeEmailValue");
    return this.http.post<boolean>(url, email);
  }
}
