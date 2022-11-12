import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ShowMessageComponent, FilterQueryComponent } from '@app/_shared';

import { BaseService, AuthService } from '@app/_services';

@Component({
  template: ``
})
export abstract class BaseItemsComponent<TDto, Tid> implements OnInit, AfterViewInit, OnDestroy {
  public modelColumns: string[] = [];
  public displayColumns: string[] = [];
  public items!: MatTableDataSource<TDto>;

  public defaultPageIndex: number = 0;
  public defaultPageSize: number = 15;
  public defaultSortColumn: string = '';
  public defaultSortOrder: "asc" | "desc" = "asc";

  public defaultFilterColumn: string = '';
  public filterQuery: string = '';

  public isLoggedIn: boolean = false;
  private destroySubject = new Subject();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(FilterQueryComponent) filter!: FilterQueryComponent;

  filterTextChanged: Subject<string> = new Subject<string>();

  @ViewChild(ShowMessageComponent) show!: ShowMessageComponent;

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
  }

  ngAfterViewInit() {
    console.log('BaseItemsComponent:  AfterViewInit().');
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
    this.filterQuery = query ?? '';
    this.getData(pageEvent);
  }

  getData(event: PageEvent) {
    const sortColumn = (this.sort) ? this.sort.active : this.defaultSortColumn;
    const sortOrder = (this.sort) ? this.sort.direction : this.defaultSortOrder;
    const filterColumn = (this.sort) ? this.sort.active : this.defaultSortColumn;
    const filterQuery = (this.filter) ? this.filter.filterText : this.filterQuery;

    this.filter.placeholder = `Filter by ${this.displayColumns[this.modelColumns.indexOf(sortColumn)]} (or part of it)...`;
    console.log(`BaseItemsComponent getData: filterQuery = ${filterQuery}, sortColumn = ${sortColumn}`);
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

  /** Debounce filter text changes 
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
  */
  /** Clears the filter query and reloads the data */
  clearSearch() {
    console.log(`clear search value ${this.filterQuery}`);
    this.filterQuery = '';
    this.loadData();
  }

  /**
   * Invoked when the user clicks on a delete button.
   * Shows a delete confirmation dialog.
   * @param id The id of the item to delete.
   */
  onDeleteClicked(id: Tid): void {
    this.show.clearMessages();

    if (!confirm(`Are you sure you want to delete?`))
      return;

    this.service.delete(id)
      .subscribe(result => {

        this.show.setMessages(true, `Item Deleted.`);

        // Reload the users data.
        this.ngOnInit(); // This causes 
      }, error => {
        console.error(error);
        switch (error.status) {
          case 400: // Bad Request
          case 404: // Not Found
          case 405: // Method Not Allowed
            this.show.setMessages(false, error.message);
            break;
          default:
            this.show.setMessages(false, `We had a problem on our end. Please try again. Message: ${error.statusText}`);
            break;
        };
      });
  }
}
