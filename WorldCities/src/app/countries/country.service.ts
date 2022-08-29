import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService, ApiResult, DeleteResult } from '../base.service';
import { Observable } from 'rxjs';

import { Country } from './country';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

@Injectable({
  providedIn: 'root'
})
export class CountryService extends BaseService<Country, number> {

  constructor(http: HttpClient) {
    super(http)
  }

  getData(
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

  get(id: number): Observable<Country> {
    var url = this.getUrl("api/Countries/" + id);
    return this.http.get<Country>(url);
  }

  put(item: Country): Observable<Country> {
    var url = this.getUrl("api/Countries/" + item.id);
    return this.http.put<Country>(url, item);
  }

  post(item: Country): Observable<Country> {
    var url = this.getUrl("api/Countries/");
    return this.http.post<Country>(url, item);
  }

  delete(item: Country): Observable<DeleteResult> {
    var url = this.getUrl("api/Countries/Delete");
    return this.http.post<DeleteResult>(url, item);
  }

  /**
   * Performs a http post to determine if a Country property already exists in the database.
   * @param countryId
   * @param fieldName
   * @param fieldValue
   */
  isDupeField(countryId: number, fieldName: string, fieldValue: string): Observable<boolean> {
    var params = new HttpParams()
      .set("countryId", countryId)
      .set("fieldName", fieldName)
      .set("fieldValue", fieldValue);
    var url = this.getUrl("api/Countries/IsDupeField");
    return this.http.post<boolean>(url, null, { params });
  }
}
