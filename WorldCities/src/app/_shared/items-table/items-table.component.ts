import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IItemsViewSource } from '@app/_shared';
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
  @Output() butClick: EventEmitter<{ key: string, id: string }> = new EventEmitter<{ key: string, id: string }>();

  ngOnInit(): void {
  }

  onButClick(key: string, id: any) {
    this.butClick.emit({ key: key, id: id });
  }

}
