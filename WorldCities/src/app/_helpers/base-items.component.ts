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
  public defaultPageIndex: number = 0;
  public defaultPageSize: number = 15;
  // sorting
  protected sort: Sort = { active: '', direction: 'asc'}; 
  // filtering
  public defaultFilterColumn: string = '';
  public filterQuery: string = '';
  // authorization
  public isLoggedIn: boolean = false;
  public isAdministrator: boolean = false;
  private destroySubject = new Subject();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('filterQuery') filter!: IQueryFilter;
  @ViewChild('showMessage') showMsg!: IShowMessage;

  constructor(
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    protected authService: AuthService,
    protected service: BaseService<TDto, Tid>) {
    console.log('BaseItemsComponent derived instance created.');

    this.setSchema();       // derived class defines the schema/metadata for it's data model.

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
   * authorized: boolean,  (Optional) Used to make 'button' type columns show, and with the 'link' type to enable the link.
   * pipeToNumber: boolean,  (Optional) Used for numeric columns to format with commas.
   * spaceAfterComma: boolean,  (Optional) Used to add a space after commas.
   * join: string,  (Optional) For when the model column is an array.  Takes the separator as a value.
   * hidden: boolean,  (Optional) Hides the column by filtering it out.
   * noSort: boolean,  (Optional) Prevents sorting on the column.
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
    console.log(`BaseItemsComponent:  sortChange col=${sort.active}, dir=${sort.direction}`);
    if (sort.active !== this.sort.active) {
      this.filter.filterText = '';
      this.filter.placeholder = `Filter by ${this.viewSource.displayColumns[
        this.viewSource.modelColumns.indexOf(sort.active)]} (or part of it)...`;
    }
    this.sort = sort;
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
    const filterColumn = this.sort.active;
    const filterQuery = (this.filter) ? this.filter.filterText : this.filterQuery;

    console.log(`BaseItemsComponent getData: filterQuery = ${filterQuery}, sortColumn = ${this.sort.active}`);
    this.service.getData(
      event.pageIndex,
      event.pageSize,
      this.sort.active,
      this.sort.direction,
      filterColumn,
      filterQuery)
      .subscribe(result => {
        this.paginator.length = result.totalCount;
        this.paginator.pageIndex = result.pageIndex;
        this.paginator.pageSize = result.pageSize;
        this.viewSource.data = result.data;
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
