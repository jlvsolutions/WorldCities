import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IItemsViewSource } from '@app/_models';
import { Sort } from '@angular/material/sort';

/**  Displays a mat-table using the provided IItemsView interface */
@Component({
  selector: 'app-items-table',
  templateUrl: './items-table.component.html',
  styleUrls: ['./items-table.component.scss']
})
export class ItemsTableComponent implements OnInit {

  constructor() { }

  /** The data used to dynamically create and populate the table. */
  @Input() source!: IItemsViewSource<any>;

  /** The tooltip to display for each item row */
  @Input() rowToolTip!: string;

  /** An event that fires when there is a change to the sorting column or sorting order. */
  @Output() sortChange: EventEmitter<Sort> = new EventEmitter<Sort>();

  /** An event that fires when the user clicks a dynamically created button */
  @Output() butClick: EventEmitter<{ key: string, id: any }> = new EventEmitter<{ key: string, id: any }>();

  /** An event that fires when the user clicks anywhere on a row */
  @Output() rowClick: EventEmitter<any> = new EventEmitter<any>();

  /** An event that fires when the mouse pointer moves over a row in the table. */
  @Output() rowMouseOver: EventEmitter<{ event: any, row: any }> = new EventEmitter<{ event: any, row: any }>();

  ngOnInit(): void {
  }

  onButClick(key: string, id: any) {
    this.butClick.emit({ key: key, id: id });
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  onRowMouseOver(event: any, row: any) {
    this.rowMouseOver.emit({ event: event, row: row });
  }
}
