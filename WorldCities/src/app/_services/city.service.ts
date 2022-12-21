import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService, SubQuery, ApiResult } from './base.service';
import { Observable, map, combineLatest } from 'rxjs';

import { City, Country, AdminRegion } from '@app/_models';
//import { Apollo, gql } from 'apollo-angular'; // GraphQL

@Injectable()
export class CityService extends BaseService<City, number> implements OnDestroy {

  constructor(
    http: HttpClient) {
    //private apollo: Apollo) {
    super(http);
    console.log('CityService instance created.');
  }
  ngOnDestroy() { console.log('CityService instance destroyed.'); }

  /**  
   * RESTful Implementation.
   * @param pageIndex
   * @param pageSize
   * @param sortColumn
   * @param sortOrder
   * @param filterColumn
   * @param filterQuery
   */
  getData(
    pageIndex: number,
    pageSize: number,
    sortColumn: string,
    sortOrder: string,
    filterColumn: string | null,
    filterQuery: string | null,
    subQuery?: SubQuery<number>): Observable<ApiResult<City>> {

    var url = this.getUrl("api/Cities", subQuery);
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

    return this.http.get<ApiResult<City>>(url, { params });
  }

  /**
   * GraphQL implementation
   * @param pageIndex
   * @param pageSize
   * @param sortColumn
   * @param sortOrder
   * @param filterColumn
   * @param filterQuery
  getData(
    pageIndex: number,
    pageSize: number,
    sortColumn: string,
    sortOrder: string,
    filterColumn: string | null,
    filterQuery: string | null): Observable<ApiResult<City>> {

    return this.apollo
      .query({
        query: gql`
          query GetCitiesApiResult(
            $pageIndex: Int!,
            $pageSize: Int!,
            $sortColumn: String,
            $sortOrder: String,
            $filterColumn: String,
            $filterQuery: String) {
          citiesApiResult(
            pageIndex: $pageIndex
            pageSize: $pageSize
            sortColumn: $sortColumn
            sortOrder: $sortOrder
            filterColumn: $filterColumn
            filterQuery: $filterQuery
          ) {
            data {
              id
              name
              lat
              lon
              population
              countryId
              countryName
            },
              pageIndex
              pageSize
              totalCount
              totalPages
              sortColumn
              sortOrder
              filterColumn
              filterQuery
            }
        }
        `,
        variables: {
          pageIndex,
          pageSize,
          sortColumn,
          sortOrder,
          filterColumn,
          filterQuery
        }
      })
      .pipe(map((result: any) =>
        result.data.citiesApiResult));
  }
   */

  /**
   *  RESTful implementation
   * @param id
   */
  get(id: number): Observable<City> {
    var url = this.getUrl("api/Cities/" + id);
    return this.http.get<City>(url);
  }

  /**
   * GraphQL implementation
   * @param id
  
  get(id: number): Observable<City> {
    return this.apollo
      .query({
        query: gql`
          query GetCityById($id: Int!) {
          cities(where: { id: { eq: $id } }) {
            nodes {
              id
              name
              lat
              lon
              population
              countryId
            }
          }
        }
        `,
        variables: {
        id
      }
    })
    .pipe(map((result: any) =>
        result.data.cities.nodes[0]));
  }
   */

  put(item: City): Observable<City> {
    var url = this.getUrl("api/Cities/" + item.id);
    return this.http.put<City>(url, item);

  }

  post(item: City): Observable<City> {
    var url = this.getUrl("api/Cities/");
    return this.http.post<City>(url, item);
  }

  delete(id: number): Observable<any> {
    var url = this.getUrl("api/Cities/" + id);
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

  isDupeCity(item: City): Observable<boolean> {
    var url = this.getUrl("api/Cities/IsDupeCity");
    return this.http.post<boolean>(url, item);
  }
}
