import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { IItemsViewSource, IQueryFilter, FilterEvent } from '@app/_models';
import { Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

/**  Displays a mat-table using the provided IItemsView interface */
@Component({
  selector: 'items-table',
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.scss']
})
export class ItemsTableComponent implements AfterViewInit  {

  @ViewChild('queryFilter') filter!: IQueryFilter;

  constructor() { }

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
  @Output() detailClick: EventEmitter<{ key: string, row: any }> = new EventEmitter<{ key: string, row: any }>();

  /** An event that fires when the user clicks anywhere on a row */
  @Output() rowClick: EventEmitter<any> = new EventEmitter<any>();

  /** An event that fires when the mouse pointer moves over a row in the table. */
  @Output() rowMouseOver: EventEmitter<{ event: any, row: any }> = new EventEmitter<{ event: any, row: any }>();

  ngAfterViewInit(): void {
    this.filter = this.source.filter;
  }

  onDetailClick(key: string, row: any) {
    this.detailClick.emit({ key: key, row: row });
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  onRowMouseOver(event: any, row: any) {
    this.rowMouseOver.emit({ event: event, row: row });
  }
}
