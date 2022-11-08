import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { BaseService, AuthService } from '@app/_services';

@Component({
  template: ''
})
export abstract class BaseItemsComponent<TDto, Tid> implements OnInit, OnDestroy {
  public displayedColumns: string[] = [];
  public items!: MatTableDataSource<TDto>;

  public defaultPageIndex: number = 0;
  public defaultPageSize: number = 15;
  public defaultSortColumn: string = "name";
  public defaultSortOrder: "asc" | "desc" = "asc";

  public defaultFilterColumn: string = "name";
  public filterQuery?: string | null = '';

  public isLoggedIn: boolean = false;
  private destroySubject = new Subject();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterTextChanged: Subject<string> = new Subject<string>();

  constructor(protected authService: AuthService, protected service: BaseService<TDto, Tid>) {
    this.authService.user
      .pipe(takeUntil(this.destroySubject))
      .subscribe(user => {
        if (user)
          console.log(`BaseItemsComponent:  user = ${user.name}, ${user.email}`);
        else
          console.log('BaseItemsComponent:  No user logged in.');
        this.isLoggedIn = authService.isAuthenticated();
      })
  }

  ngOnInit() {
    console.log('BaseItemsComponent:  OnInit().');
    this.clearSearch();
    this.loadData();
 }

  ngOnDestroy() {
    console.log('BaseItemsComponent derived class instance destroyed.');
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }

  loadData(query?: string) {
    let pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;
    this.filterQuery = query;
    this.getData(pageEvent);
  }

  getData(event: PageEvent) {
    var sortColumn = (this.sort) ? this.sort.active : this.defaultSortColumn;
    var sortOrder = (this.sort) ? this.sort.direction : this.defaultSortOrder;
    var filterColumn = (this.filterQuery) ? this.defaultFilterColumn : null;
    var filterQuery = (this.filterQuery) ? this.filterQuery : null;

    this.service.getData(
      event.pageIndex,
      event.pageSize,
      sortColumn,
      sortOrder,
      filterColumn,
      filterQuery)
      .subscribe(result => {
        this.paginator.length = result.totalCount;
        this.paginator.pageIndex = result.pageIndex;
        this.paginator.pageSize = result.pageSize;
        this.items = new MatTableDataSource<TDto>(result.data);
      }, error => console.error(error));
  }

  /** Debounce filter text changes */
  onFilterTextChanged(filterText: string) {
    if (this.filterTextChanged.observers.length === 0) {
      this.filterTextChanged
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(query => {
          this.loadData(query);
        })
    }
    this.filterTextChanged.next(filterText);
  }

  /** Clears the filter query and reloads the data */
  clearSearch() {
    console.log(`clear search value ${this.filterQuery}`);
    this.filterQuery = '';
    this.loadData();
  }
}
