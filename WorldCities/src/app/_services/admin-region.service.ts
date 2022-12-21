import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService, SubQuery, ApiResult } from './base.service';
import { Observable, map, combineLatest } from 'rxjs';

import { AdminRegion, Country } from '@app/_models';

@Injectable({
  providedIn: 'root'
})
export class AdminRegionService extends BaseService<AdminRegion, number> implements OnDestroy {

  constructor(
    http: HttpClient) {
    super(http);
    console.log('AdminRegionService instance created.');
  }
  ngOnDestroy() { console.log('AdminRegionService instance destroyed.'); }

  getData(
    pageIndex: number,
    pageSize: number,
    sortColumn: string,
    sortOrder: string,
    filterColumn: string | null,
    filterQuery: string | null,
    subQuery?: SubQuery<number>): Observable<ApiResult<AdminRegion>> {

    var url = this.getUrl("api/AdminRegions", subQuery);
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

    return this.http.get<ApiResult<AdminRegion>>(url, { params });
  }

  get(id: number): Observable<AdminRegion> {
    var url = this.getUrl("api/AdminRegions/" + id);
    return this.http.get<AdminRegion>(url);
  }

  put(item: AdminRegion): Observable<AdminRegion> {
    var url = this.getUrl("api/AdminRegions/" + item.id);
    return this.http.put<AdminRegion>(url, item);

  }

  post(item: AdminRegion): Observable<AdminRegion> {
    var url = this.getUrl("api/AdminRegions/");
    return this.http.post<AdminRegion>(url, item);
  }

  delete(id: number): Observable<any> {
    var url = this.getUrl("api/AdminRegions/" + id);
    return this.http.delete<any>(url);
  }

  getCountries(
    pageIndex: number,
    pageSize: number,
    sortColumn: string,
    sortOrder: string,
    filterColumn: string | null,
    filterQuery: string | null): Observable<ApiResult<Country>> {
    var url = this.getUrl("api/Countries");
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
    return this.http.get<ApiResult<Country>>(url, { params });
  }

  isDupeAdminRegion(item: AdminRegion): Observable<boolean> {
    var url = this.getUrl("api/Cities/IsDupeAdminRegion");
    return this.http.post<boolean>(url, item);
  }
}
