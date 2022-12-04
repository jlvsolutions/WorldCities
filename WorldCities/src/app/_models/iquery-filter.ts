import { EventEmitter } from '@angular/core';

/** Interface for components which provide parameters for filtering queries. */
export interface IQueryFilter {
  /** Filtering text for query */
  query: string;
  /** Column to apply the filter on */
  column: string;
  /** Columns to choose from to which to apply the filtering text */
  columns: FilterColumn[];
  /** Prompting for filter text */
  placeholder: string;
  /** Event fired when the filter state has changed. */
  //filterChange: EventEmitter<FilterEvent>;
}

export class FilterColumn {
  col: string = '';
  label: string = '';
}

/** The curernt filter state. */
export class FilterEvent {
  /** The filtering text. */
  query: string = '';
  /** The name of the column being filtered. */
  column: string = '';
}
