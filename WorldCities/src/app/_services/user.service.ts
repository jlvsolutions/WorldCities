import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService, SubQuery, ApiResult } from './base.service';
import { Observable } from 'rxjs';

import { User } from '@app/_models';

@Injectable()
export class UserService extends BaseService<User, string> implements OnDestroy {

  constructor(http: HttpClient) {
    super(http);
    console.log('UserService instance created.');
  }
  ngOnDestroy() { console.log('UserService instance destroyed.'); }

  getData(
    pageIndex: number,
    pageSize: number,
    sortColumn: string,
    sortOrder: string,
    filterColumn: string | null,
    filterQuery: string | null,
    subQuery?: SubQuery<string>): Observable<ApiResult<User>> {

    var url = this.getUrl("api/Users", subQuery);
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
    var url = this.getUrl("api/Users/" + id);
    return this.http.get<User>(url);
  }

  put(user: User): Observable<User> {
    var url = this.getUrl("api/Users/" + user.id);
    return this.http.put<User>(url, user);
  }

  post(user: User): Observable<User> {
    var url = this.getUrl("api/Users");
    return this.http.post<User>(url, user);
  }

  delete(id: string): Observable<any> {
    var url = this.getUrl("api/Users/" + id);
    return this.http.delete<any>(url);
  }

  getAllRoles(): Observable<string[]> {
    var url = this.getUrl("api/Users/Roles");
    return this.http.get<string[]>(url);
  }
}
