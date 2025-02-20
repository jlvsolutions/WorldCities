import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationStart, NavigationEnd, Params } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort, SortDirection } from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';

import { IQueryFilter, IShowMessage, IItemsViewSource, ItemsViewSource, FilterColumn, FilterEvent, RowMouseOverEvent } from '@app/_models';
import { BaseService, SubQuery, AuthService } from '@app/_services';

/** Base class for displaying a collection of items. */
@Component({
    template: ``,
    standalone: false
})
export abstract class BaseItemsComponent<TDto, TId> implements OnInit, AfterViewInit, OnDestroy {

  title: string = '';
  titleSuffix: string = '';
  subQuery?: SubQuery<TId>;

  // row
  rowTooltip: string = '';

  // authorization
  public isLoggedIn: boolean = false;
  public isAdministrator: boolean = false;
  private destroySubject = new Subject();

  public viewSource: IItemsViewSource<TDto> = new ItemsViewSource<TDto>();
  filterOut: FilterEvent = new FilterEvent();

  @ViewChild('iShowMessage') showMsg!: IShowMessage;

  constructor(
    protected changeDetector: ChangeDetectorRef,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    protected authService: AuthService,
    protected service: BaseService<TDto, TId>) {

    console.log('BaseItemsComponent derived instance created.');
    this.setViewSourceSchema();
    this.setDefaults();
  }

  ngOnInit() {
    console.log('BaseItemsComponent:  OnInit().');
    this.subscribeToAuthorizationChanges();
    this.subscribeToQueryParams();  // This causes a call to getData
 }

  ngAfterViewInit() {
    console.log('BaseItemsComponent:  AfterViewInit.');
  }

  ngOnDestroy() {
    console.log('BaseItemsComponent derived class instance destroyed.');
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }

  /** Returns the schema/metadata for the derived class' model. */
  abstract getItemSchema(): any[];
  private setViewSourceSchema(): void {
    this.viewSource.schema = this.getItemSchema().filter(s => !s.hidden);
  }

  /** Used to provide a descriptive name for the data item from the model with given id.  */
  abstract getNameOfItem(id: TId): string;

  /** Returns the default column for sorting and filtering. */
  abstract getDefaultColumn(): string;

  private setDefaults(): void {
    console.log('BaseItemsComponent:  setDefaults()');
    this.titleSuffix = ''; 

    this.viewSource.sort = { active: this.getDefaultColumn(), direction: 'asc' };
    this.viewSource.paginator = {
      pageIndex: 0,
      pageSize: 10,
      pageSizeOptions: [10, 15, 25, 50, 100, 250, 500, 1000, 5000],
      totalCount: 0
    }

    if (this.viewSource.filter == undefined)
      this.viewSource.filter = {
        query: '',
        column: this.getDefaultColumn(),
        columns: this.viewSource.filterColumns,
        placeholder: ''
      }
    else {
      this.viewSource.filter.columns = this.viewSource.filterColumns;
      this.viewSource.filter.column = this.getDefaultColumn();
      this.viewSource.filter.query = '';
      this.filterOut = { column: this.getDefaultColumn(), query: '' };
    }
    console.log(`BaseItemsComponent setDefaults: viewsource.filter.column=${this.viewSource.filter.column}, viewsource.filter.query=${this.viewSource.filter.query}`);
  }

  /** Used to provide custom row tooltips for each data items. */
  abstract getRowToolTip(row: any): string;
  onRowMouseOver(event: RowMouseOverEvent) {
    this.rowTooltip = this.getRowToolTip(event.row);
  }

  onSortChange(sort: Sort) {
    console.log(`BaseItemsComponent:  sortChange col=${sort.active}, dir=${sort.direction}`);
    if (sort.active !== this.viewSource.sort?.active) {
      this.viewSource.filter.query = '';
      this.viewSource.paginator.pageIndex = 0;
    }
    else if (sort.direction !== this.viewSource.sort?.direction) {
      this.viewSource.paginator.pageIndex = 0;
    }
    this.viewSource.sort = sort;
    this.getData();
  }

  onFilterChange(query: FilterEvent) {
    console.log(`BaseItemsComponent onFilterChange query=${query.query}, column=${query.column}`);
    this.titleSuffix = '';
    this.viewSource.filter.column = query.column;
    this.filterOut.column = query.column;
    this.filterOut.query = query.query;
    this.viewSource.paginator.pageIndex = 0;
    this.getData();
  }

  onPageChange(pageEvent: PageEvent) {
    this.viewSource.paginator.pageIndex = pageEvent.pageIndex;
    this.viewSource.paginator.pageSize = pageEvent.pageSize;
    this.getData();
  }

  onParamsChange(params: Params) {
    console.log('BaseItemsComponent:  onParamsChange.');
    this.viewSource.sort.active = params['sortColumn'] ?? this.getDefaultColumn();
    this.viewSource.filter.column = params['filterColumn'] ?? this.getDefaultColumn();
    this.viewSource.filter.query = params['filterQuery'] ?? '';
    this.filterOut.column = params['filterColumn'] ?? '';
    this.filterOut.query = params['filterQuery'] ?? '';

    console.log(`BaseItemsComponent:  BaseItemsComponent: OnParamsChange filterColumn=${this.filterOut.column}, filterQuery=${this.filterOut.query}, sortColomn=${this.viewSource.sort.active}`);
    if (this.viewSource.filter.column === '' && this.viewSource.filter.query === '')
      this.setDefaults();
    else
      this.titleSuffix = ' - ' + this.viewSource.filter.query;

    //this.changeDetector.detectChanges();
    //this.changeDetector.markForCheck();
    this.getData();
  }

  getData() {
    console.log(`BaseItemsComponent getData: filterQuery=${this.filterOut.query}, filterColumn=${this.filterOut.column}, ` +
      `sortColumn=${this.viewSource.sort.active}, pageIndex=${this.viewSource.paginator.pageIndex}, subQuery=${this.subQuery?.name}=${this.subQuery?.id}`);
    if (this.showMsg)
      this.showMsg.spinner = "Retrieving...";

    this.service.getData(
      this.viewSource.paginator.pageIndex,
      this.viewSource.paginator.pageSize,
      this.viewSource.sort.active,
      this.viewSource.sort.direction,
      this.filterOut.column,
      this.filterOut.query,
      this.subQuery)
      .subscribe(result => {
        console.log(`BaseItemsComponent getData Result: ${result.data.length} items returned.`);
        this.viewSource.data = result.data;
        this.viewSource.paginator.pageIndex = result.pageIndex;
        this.viewSource.paginator.pageSize = result.pageSize;
        this.viewSource.paginator.totalCount = result.totalCount;
        this.titleSuffix = result.title === null ? '' : ' - ' + result.title;
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
  protected deleteItem(id: TId): void {
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

  abstract onParamsChanged(params: Params): void;
  private subscribeToQueryParams(): void {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroySubject))
      .subscribe(params => {
        this.onParamsChanged(params);
        this.onParamsChange(params);
      });
  }

  private subscribeToAuthorizationChanges(): void {
    this.authService.user       // listen for authorization changes.
      .pipe(takeUntil(this.destroySubject))
      .subscribe(user => {
        this.isLoggedIn = this.authService.isAuthenticated();
        this.isAdministrator = this.authService.isAdministrator();
        this.setViewSourceSchema();
      });

  }

}
