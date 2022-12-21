import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export abstract class BaseService<TDto, TId> {

  protected constructor(protected http: HttpClient) {
  }

  /**
   * Retrieves data from the back end.  Filtering is performed first, then sorting.
   * @param pageIndex
   * @param pageSize
   * @param sortColumn
   * @param sortOrder
   * @param filterColumn
   * @param filterQuery
   */
  abstract getData(
    pageIndex: number,
    pageSize: number,
    sortColumn: string,
    sortOrder: string,
    filterColumn: string | null,
    filterQuery: string | null,
    subQuery?: SubQuery<TId>): Observable<ApiResult<TDto>>;

  abstract get(id: TId): Observable<TDto>;
  abstract put(item: TDto): Observable<TDto>;
  abstract post(item: TDto): Observable<TDto>;
  abstract delete(id: TId): Observable<any>;

  protected getUrl(url: string, subQuery?: SubQuery<TId>) {
    var url = environment.baseUrl + url;
    if (subQuery) {
      url = url + '/' + subQuery.name;
      if (subQuery.id)
        url = url + '/' + subQuery.id;
    }
    return url;
  }
}

export interface ApiResult<T> {
  data: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  sortColumn: string;
  sortOrder: string;
  filterColumn: string;
  filterQuery: string;
  title: string;
}

export class SubQuery<TId> {
  /** Property of the sub query's navigation property */
  name: string = '';
  /** Id of the sub query's navigation property */
  id?: TId;
}



