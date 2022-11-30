import { EventEmitter } from '@angular/core';

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

export class FilterColumn {
  col: string = '';
  label: string = '';
}

export interface IFilter {
  filterQuery: string,
  filterColumn: string,
  placeholder: string,
  columns: FilterColumn[]
}

export class FilterEvent {
  query: string = '';
  column: string = '';
}
