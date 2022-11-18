import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';

import { IFilterQuery, IShowMessage, IItemsViewSource, ItemsViewSource } from '@app/_shared';
import { BaseService, AuthService } from '@app/_services';

/** Base class for displaying a collection of items. */
@Component({
  template: ``
})
export abstract class BaseItemsComponent<TDto, Tid> implements OnInit, AfterViewInit, OnDestroy {

  public viewSource: IItemsViewSource<TDto> = new ItemsViewSource<TDto>();

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
  @ViewChild('filterQuery') filter!: IFilterQuery;
  @ViewChild('showMessage') showMsg!: IShowMessage;

  constructor(protected authService: AuthService, protected service: BaseService<TDto, Tid>) {
    console.log('BaseItemsComponent derived instance created.');

    this.setSchema();  // derived class defines the schema/metadata for it's data model.

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

  /** Used to define the schema/metadata for the derived class' model.
   * Available properties are:
   *
   * Key:  Identifies data model's property name.  If 'type' is 'button', the key is used to identify the button.
   * label:  Display friendly string for use in the column header.
   * type:  (Optional) Can be 'button', 'link', or (future) 'boolean'.
   * description:  (Optional) Used for displaying tooltip in the column header.
   * toolTip:  (Optional) Used to give tooltips for 'button' and 'link' types.
   * itemName:  (Optional) Used for 'button' and 'link' tooltips.
   * link:  (Optional) Used with 'link' types.  Provides the route.
   * linkId:  (Optional) Used with 'link' types to augment the route given in 'link'.
   * authorized:  (Optional) Used with 'button' type to filter out the the column, and with 'link' type to disable the link.
   * pipeToNumber:  (Optional) Used for numeric columns to format with commas.
   * spaceAfterComma:  (Optional) Used to add a space after commas.
   * hidden:  (Optional) Hides the column by filtering it out.
   * */
  abstract defineSchema(): any[];
  private setSchema(): void {
    this.viewSource.schema = this.defineSchema()
      .filter(s => (!(s.type === 'button' && !s.authorized)) && !s.hidden);
  }

  /**
   *  Used to provide a descriptive name for the model item with the given id. 
   * @param id
   */
  abstract nameOfItem(id: Tid): string;

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
        this.viewSource.data = result.data; // Latest factoring.....
      }, error => {
        console.error(error);
        this.showMsg.errMessage = error.error;
      });
  }

  /**
   * Invoked when the user clicks on a delete button.  Shows a delete confirmation dialog.
   * @param id The id of the item to delete.
   */
  deleteItem(id: Tid): void {   // TODO: Change to protected after implementing new items-table component  !!!!
    this.showMsg.clear();

    if (!confirm(`Are you sure you want to delete ${this.nameOfItem(id)}?`))
      return;

    this.service.delete(id)
      .subscribe(result => {

        this.showMsg.message = 'Item deleted.';

        // Reload the users data.
        this.ngOnInit(); // This causes 
      }, error => {
        console.error(error);
        switch (error.status) {
          case 400: // Bad Request
          case 404: // Not Found
          case 405: // Method Not Allowed
            this.showMsg.errMessage = error.error;
            break;
          default:
            this.showMsg.errMessage = `We had a problem on our end. Please try again. Message: ${error.statusText}`;
            break;
        };
      });
  }
}
