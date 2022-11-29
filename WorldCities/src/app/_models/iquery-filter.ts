import { EventEmitter } from '@angular/core';
import { FilterEvent, FilterColumn } from '@app/_models';

/** Interface for components which provide input to filter queries */
export interface IQueryFilter {
  /** Filtering text for query */
  filterText: string;
  /** Column to apply the filter on */
  filterColumn: string;
  /** Columns to choose from to which to apply the filtering text */
  columns: FilterColumn[];
  /** Prompting for filter text */
  placeholder: string;
  /** Event fired when a new query is requested.  Contains the filtering text and column. */
  filterChange: EventEmitter<FilterEvent>;
}
