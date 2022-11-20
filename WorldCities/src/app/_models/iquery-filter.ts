import { EventEmitter } from "@angular/core";

/** Interface for components which provide input to filter queries */
export interface IQueryFilter {
  /** Text for filtering a query */
  filterText: string;
  /** Prompting text for input */
  placeholder: string;
  /** Event fired when a new query is requested.  Contains the filtering text to use. */
  search: EventEmitter<string>;
}
