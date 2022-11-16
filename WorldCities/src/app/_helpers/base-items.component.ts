import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';

import { ItemsViewSource } from '@app/_models';
import { ShowMessageComponent, FilterQueryComponent } from '@app/_shared';
import { BaseService, AuthService } from '@app/_services';

/** Base class for displaying a collection of items. */
@Component({
  template: ``
})
export abstract class BaseItemsComponent<TDto, Tid> implements OnInit, AfterViewInit, OnDestroy {
  public viewSource = new ItemsViewSource<TDto>();
  public modelColumns: string[] = [];
  public displayColumns: string[] = [];
  public items!: MatTableDataSource<TDto>;

  public defaultPageIndex: number = 0;
  public defaultPageSize: number = 15;
  public defaultSortColumn: string = '';
  public defaultSortOrder: '' | 'asc' | 'desc' = 'asc';
  public defaultFilterColumn: string = '';
  public filterQuery: string = '';

  public isLoggedIn: boolean = false;
  public isAdministrator: boolean = false;
 
  private destroySubject = new Subject();

  protected sort!: Sort; 
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(FilterQueryComponent) filter!: FilterQueryComponent;
  @ViewChild(ShowMessageComponent) show!: ShowMessageComponent;

  constructor(protected authService: AuthService, protected service: BaseService<TDto, Tid>) {
    this.authService.user
      .pipe(takeUntil(this.destroySubject))
      .subscribe(user => {
        this.isLoggedIn = authService.isAuthenticated();
        this.isAdministrator = authService.isAdministrator();
        this.setSchema();
        if (this.isLoggedIn)
          console.log(`BaseItemsComponent:  user = ${user.name}, ${user.email} logged in. Administrator: ${this.isAdministrator}`);
        else
          console.log('BaseItemsComponent:  No user logged in.');
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

  sortChange(sort: Sort) {
    console.log(`BaseItemsComponent:  sortChanged col=${sort.active}, dir=${sort.direction}`);
    this.sort = sort;
    this.filter.filterText = '';
    this.loadData();
  }

  setSchema() {
    console.log('BaseItemsComponent setSchema called.');
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

    this.filter.placeholder = `Filter by ${this.viewSource.displayColumns[
      this.viewSource.modelColumns.indexOf(sortColumn)]} (or part of it)...`;

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
        this.viewSource.data = result.data; // Latest factoring.....
      }, error => {
        console.error(error);
        this.show.setMessages(false, error.error);
      });
  }

  /**
   * Invoked when the user clicks on a delete button.  Shows a delete confirmation dialog.
   * @param id The id of the item to delete.
   */
  onDeleteClicked(id: Tid): void {
    this.show.clearMessages();

    if (!confirm(`Are you sure you want to delete ${this.nameOfItem(id)}?`))
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

  protected nameOfItem(id: any): string {
    return `${id}`;
  }
}
