import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';

import { IQueryFilter, IShowMessage, IItemsViewSource, ItemsViewSource } from '@app/_models';
import { BaseService, AuthService } from '@app/_services';

/** Base class for displaying a collection of items. */
@Component({
  template: ``
})
export abstract class BaseItemsComponent<TDto, Tid> implements OnInit, AfterViewInit, OnDestroy {

  public viewSource: IItemsViewSource<TDto> = new ItemsViewSource<TDto>();

  // pagination
  pageIndex: number = 0;
  pageSize: number = 10;
  // sorting
  sortColumn: string = '';
  sortOrder: '' | 'desc' | 'asc' = 'asc';
  // filtering
  filterColumn: string = '';
  filterQuery: string = ''
  filterPlaceholder: string = 'Enter filtering text...';
  // row
  rowTooltip: string = 'default ';
  // authorization
  public isLoggedIn: boolean = false;
  public isAdministrator: boolean = false;
  private destroySubject = new Subject();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('queryFilter') filter!: IQueryFilter;
  @ViewChild('showMessage') showMsg!: IShowMessage;

  constructor(
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    protected authService: AuthService,
    protected service: BaseService<TDto, Tid>) {
    console.log('BaseItemsComponent derived instance created.');

    this.setSchema();           // derived class defines the schema/metadata for it's data model.

    this.authService.user   // listen for authorization changes.
      .pipe(takeUntil(this.destroySubject))
      .subscribe(user => {
        this.isLoggedIn = authService.isAuthenticated();
        this.isAdministrator = authService.isAdministrator();
        this.setSchema();
        /*
        if (this.isLoggedIn) {
          console.log(`BaseItemsComponent:  user = ${user.name}, ${user.email} logged in. Administrator: ${this.isAdministrator}`);
          this.showMsg.message = "Welcome, " + user.name + "!";
        }
        else {
          console.log('BaseItemsComponent:  No user logged in.');
          this.showMsg.message = "You are now logged out.";
        }
        */
      });
    /*
    this.router.events      // listen for routing events.
      .pipe(takeUntil(this.destroySubject))
      .subscribe(event => {
        //if (event instanceof NavigationStart)
        //  this.showMsg.clear();
        if (event instanceof NavigationEnd) // Note:  happens for all navigations since this component not destroyed.
          this?.showMsg?.clear();
      })
    */
  }

  /** Used to define the schema/metadata for the derived class' model.
   * Available properties are:
   *
   * Key: string,  Identifies data model's property name.  If 'type' is 'button', the key is used to identify the button.
   * label: string,  Display friendly string for use in the column header.
   * type: string,  (Optional) Can be 'button', 'link', or (future) 'boolean'.  'link' requires authorized: true to be enabled.
   * description: string,  (Optional) Used for displaying tooltip in the column header.
   * toolTip: string,  (Optional) Used to give tooltips for 'button' and 'link' types.
   * itemName: string,  (Optional) Used for 'button' and 'link' tooltips.
   * link: string,  (Optional) Used with 'link' types.  Provides the route.
   * linkId: string,  (Optional) Used with 'link' types to augment the route given in 'link'.
   * param: string, (Optional) Used with type 'button' to provide identifying parameter to the click handler.
   * pipeToNumber: boolean,  (Optional) Used for numeric columns to format with commas.
   * spaceAfterComma: boolean,  (Optional) Used to add a space after commas.
   * join: string,  (Optional) For when the model column is an array.  Takes the separator as a value.
   * hidden: boolean,  (Optional) Hides the column by filtering it out.
   * noSort: boolean,  (Optional) Prevents sorting on the column.
   */
  abstract defineSchema(): any[];

  private setSchema(): void {
    this.viewSource.schema = this.defineSchema()
      .filter(s => !s.hidden);
  }

  /** Used to provide a descriptive name for the model item with the given id.  */
  abstract nameOfItem(id: Tid): string;

  /** Used to set the initial column for sorting and filtering. */
  abstract defineDefaultColumn(): string;

  private setDefaultColumn(): void {
    this.sortColumn = this.defineDefaultColumn();
    this.filterColumn = this.sortColumn;
    this.filterPlaceholder = this.getFilterPlacehoder(this.sortColumn);
  }

  private getFilterPlacehoder(columnName: string): string {
    return `Filter by ${this.viewSource.displayColumns[
      this.viewSource.modelColumns.indexOf(columnName)]} (or part of it)...`;
  }

  ngOnInit() {
    console.log('BaseItemsComponent:  OnInit().');
    this.setDefaultColumn();
    this.getData();
 }

  ngAfterViewInit() {
    console.log('BaseItemsComponent:  AfterViewInit().');
  }

  ngOnDestroy() {
    console.log('BaseItemsComponent derived class instance destroyed.');
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }

  abstract getRowToolTip(row: any): string;
  onRowMouseOver(event: any) {
    this.rowTooltip = this.getRowToolTip(event.row);
  }

  onSortChange(sort: Sort) {
    console.log(`BaseItemsComponent:  sortChange col=${sort.active}, dir=${sort.direction}`);
    if (sort.active !== this.sortColumn) {
      this.filterQuery = '';
    }
    this.filterPlaceholder = this.getFilterPlacehoder(sort.active);
    this.filterColumn = sort.active;
    this.sortColumn = sort.active;
    this.sortOrder = sort.direction;
    this.getData();
  }

  onFilterChange(query: string) {
    this.filterQuery = query;
    this.pageIndex = 0;
    this.getData();
  }

  onPageChange(pageEvent: PageEvent) {
    this.pageIndex = pageEvent.pageIndex;
    this.pageSize = pageEvent.pageSize;
    this.getData();
  }

  getData() {
    console.log(`BaseItemsComponent getData: filterQuery = ${this.filterQuery}, sortColumn = ${this.sortColumn}, pageIndex=${this.pageIndex}`);
    this.service.getData(
      this.pageIndex,
      this.pageSize,
      this.sortColumn,
      this.sortOrder,
      this.filterColumn,
      this.filterQuery)
      .subscribe(result => {
        console.log(`BaseItemsComponent getData Result: ${result.data.length} items returned.`);
        this.paginator.length = result.totalCount;
        this.paginator.pageIndex = result.pageIndex;
        this.paginator.pageSize = result.pageSize;
        this.viewSource.data = result.data;
        this.showMsg.message = `Showing items ${this.itemsRetrievedText(result.totalCount, result.pageIndex, result.pageSize)}`;
      }, error => {
        switch (error.status) {
          case 400:
            this.showMsg.errMessage = 'That feature is not supported: ' + error.statusText;
            break;
          default:
            this.showMsg.errMessage = 'Oops!  We had a problem on our end with that request.';
        }
        console.error(error);
      });
  }
  /** Returns 'x - y of z' */
  itemsRetrievedText(totalCount: number, pageIndex: number, pageSize: number): string {
    const from = (pageIndex * pageSize) + 1;
    const to = (pageSize * (pageIndex + 1)) > totalCount ? totalCount : (pageSize * (pageIndex + 1));
    return `${from} - ${to} of ${totalCount.toLocaleString('en-US')}`;
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
