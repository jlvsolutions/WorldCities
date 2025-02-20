import { Component, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { IItemsViewSource, IQueryFilter, FilterEvent, DetailEvent, RowMouseOverEvent } from '@app/_models';
import { Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { QueryFilterComponent } from '../query-filter/query-filter.component';

/**  Displays a mat-table using the provided IItemsView interface */
@Component({
    selector: 'items-table',
    templateUrl: './items-table.component.html',
    styleUrls: ['./items-table.component.scss'],
    standalone: false
})
export class ItemsTableComponent implements OnDestroy, OnInit, AfterViewInit  {

  @ViewChild(QueryFilterComponent) filter!: IQueryFilter;

  /** The data used to dynamically create and populate the table. */
  @Input() source!: IItemsViewSource<any>;

  /** The tooltip to display for each item row */
  @Input() rowToolTip!: string;

  /** An event that fires when there is a change to the sorting column or sorting order. */
  @Output() sortChange: EventEmitter<Sort> = new EventEmitter<Sort>();

  /** An event that fires when the paginator requests new page. */
  @Output() pageChange: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  /** An event that fires when the text of the query filter changes. */
  @Output() filterChange: EventEmitter<FilterEvent> = new EventEmitter<FilterEvent>();

  /** An event that fires when the user clicks a dynamically created button or hyperlink */
  @Output() detailClick: EventEmitter<DetailEvent> = new EventEmitter<DetailEvent>();

  /** An event that fires when the user clicks anywhere on a row */
  @Output() rowClick: EventEmitter<any> = new EventEmitter<any>();

  /** An event that fires when the mouse pointer moves over a row in the table. */
  @Output() rowMouseOver: EventEmitter<RowMouseOverEvent> = new EventEmitter<RowMouseOverEvent>();

  private loggingEnabled: boolean = true;

  constructor() { }

  ngOnInit() {
    this.log(`OnInit: filter=${this.filter}`);
  }

  ngAfterViewInit(): void {
    this.log(`AfterViewInit: Setting source.filter to filter=${this.filter}`);
    this.source.filter = this.filter;
  }

  ngOnDestroy(): void {
    this.sortChange.complete();
    this.pageChange.complete();
    this.filterChange.complete();
    this.detailClick.complete();
    this.rowClick.complete();
    this.rowMouseOver.complete();
  }

  private log(msg: string): void {
    if (this.loggingEnabled)
      console.log(`ItemsTableComponent:  ${msg}`);
  }
}
