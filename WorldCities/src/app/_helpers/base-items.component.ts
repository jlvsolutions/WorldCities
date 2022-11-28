import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

  title: string = '';
  titleSuffix: string = '';

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

  public viewSource: IItemsViewSource<TDto> = new ItemsViewSource<TDto>();

  @ViewChild('queryFilter') filter!: IQueryFilter;
  @ViewChild('showMessage') showMsg!: IShowMessage;

  constructor(
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    protected authService: AuthService,
    protected service: BaseService<TDto, Tid>) {

    console.log('BaseItemsComponent derived instance created.');
    this.setSchema();           // derived class defines the schema/metadata for it's data model.
    this.setDefaults();         // derived class sets some of the defaults.
  }

  ngOnInit() {
    console.log('BaseItemsComponent:  OnInit().');
    this.subscribeToAuthorizationChanges();
    this.subscribeToQueryParams();
 }

  ngAfterViewInit() {
    console.log('BaseItemsComponent:  AfterViewInit().');
 }

  ngOnDestroy() {
    console.log('BaseItemsComponent derived class instance destroyed.');
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }

  /** Returns the schema/metadata for the derived class' model. */
  abstract getSchema(): any[];

  private setSchema(): void {
    this.viewSource.schema = this.getSchema()
      .filter(s => !s.hidden);
  }

  /** Used to provide a descriptive name for the data item from the model with given id.  */
  abstract getNameOfItem(id: Tid): string;

  /** Returns the default column for sorting and filtering. */
  abstract getDefaultColumn(): string;

  private setDefaults(): void {
    this.titleSuffix = ''; 

    this.filterQuery = '';
    this.filterColumn = this.getDefaultColumn();
    this.filterPlaceholder = this.getFilterPlacehoder(this.filterColumn);

    this.viewSource.sort = { active: this.getDefaultColumn(), direction: 'asc' };
    this.viewSource.paginator = {
      pageIndex: 0,
      pageSize: 10,
      pageSizeOptions: [10, 15, 25, 50, 100, 250, 1000, 5000],
      totalCount: 0
    }
  }

  private getFilterPlacehoder(columnName: string): string {
    return `Filter by ${this.viewSource.displayColumns[
      this.viewSource.modelColumns.indexOf(columnName)]} (or part of it)...`;
  }

  /** Used to provide custom row tooltips for each data items. */
  abstract getRowToolTip(row: any): string;

  onRowMouseOver(event: any) {
    this.rowTooltip = this.getRowToolTip(event.row);
  }

  onSortChange(sort: Sort) {
    console.log(`BaseItemsComponent:  sortChange col=${sort.active}, dir=${sort.direction}`);
    if (sort.active !== this.viewSource.sort?.active) {
      this.filterQuery = '';
    }
    this.filterPlaceholder = this.getFilterPlacehoder(sort.active); // This until IQueryFilter implemented
    this.filterColumn = sort.active;                                // This until IQueryFilter implemented
    this.viewSource.sort = sort;
    this.getData();
  }

  onFilterChange(query: string) {
    console.log(`BaseItemsComponent onFilterChange query=${query}`);
    this.titleSuffix = '';
    this.filterQuery = query;
    this.viewSource.paginator.pageIndex = 0;
    this.getData();
  }

  onPageChange(pageEvent: PageEvent) {
    this.viewSource.paginator.pageIndex = pageEvent.pageIndex;
    this.viewSource.paginator.pageSize;
    this.getData();
  }

  getData() {
    console.log(`BaseItemsComponent getData: filterQuery=${this.filterQuery}, filterColumn=${this.filterColumn}, sortColumn=${this.viewSource.sort.active}, pageIndex=${this.viewSource.paginator.pageIndex}`);
    if (this.showMsg)
      this.showMsg.spinner = "Retrieving...";

    this.service.getData(
      this.viewSource.paginator.pageIndex,
      this.viewSource.paginator.pageSize,
      this.viewSource.sort.active,
      this.viewSource.sort.direction,
      this.filterColumn,
      this.filterQuery)
      .subscribe(result => {
        console.log(`BaseItemsComponent getData Result: ${result.data.length} items returned.`);
        this.viewSource.data = result.data;
        this.viewSource.paginator.pageIndex = result.pageIndex;
        this.viewSource.paginator.pageSize = result.pageSize;
        this.viewSource.paginator.totalCount = result.totalCount;
        this.showMsg.message = `Showing results ${this.itemsRetrievedText(result.totalCount, result.pageIndex, result.pageSize)}`;
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

    if (!confirm(`Are you sure you want to delete ${this.getNameOfItem(id)}?`))
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

  private subscribeToQueryParams(): void {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroySubject))
      .subscribe(params => {
        this.filterColumn = this.viewSource.sort.active = params['filterColumn'] ?? '';
        this.filterQuery = params['filterQuery'] ?? '';
        this.viewSource.sort.active = params['sortColumn'] ?? '';
        console.log(`BaseItemsComponent:  urlParams changed filterColumn=${this.filterColumn}, filterQuery=${this.filterQuery}`);
        if (this.filterColumn === '' && this.filterQuery === '') {
          this.setDefaults();
          console.log(`BaseItemsComponent:  Resetting to defaults: filterColumn=${this.filterColumn}, filterQuery=${this.filterQuery}`);
        }
        else
          this.titleSuffix = ' - ' + this.filterQuery;
        this.getData();  // gets called immediatly when first subscribes.  like a behaviorsubject.
      });
  }

  private subscribeToAuthorizationChanges(): void {
    this.authService.user       // listen for authorization changes.
      .pipe(takeUntil(this.destroySubject))
      .subscribe(user => {
        console.log(`BaseItemsComponent:  User changed user=${user?.email}`);
        this.isLoggedIn = this.authService.isAuthenticated();
        this.isAdministrator = this.authService.isAdministrator();
        this.setSchema();
      });

  }
}
