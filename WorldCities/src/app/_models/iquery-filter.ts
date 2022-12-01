import { EventEmitter } from '@angular/core';

/** Interface for components which provide input to filter queries. */
export interface IQueryFilter {
  /** Filtering text for query */
  query: string;
  /** Column to apply the filter on */
  column: string;
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
  query: string,
  column: string,
  placeholder: string,
  columns: FilterColumn[]
}

/** The curernt filter state. */
export class FilterEvent {
  /** The filtering text. */
  query: string = '';
  /** The name of the column being filtered. */
  column: string = '';
}
