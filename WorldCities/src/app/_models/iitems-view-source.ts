import { Sort } from '@angular/material/sort';
import { IFilter } from '@app/_models';

export interface IPaginator {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  pageSizeOptions: number[];
}

export interface IItemsViewSource<TDto> {
  sort: Sort;
  paginator: IPaginator;
  filter: IFilter;
  schema: ItemSchema[];
  data: TDto[];

  /** Gets a string array of the model's property names from the schema */
  get modelColumns(): string[];
  /** Gets a string array of column labels from the schema */
  get displayColumns(): string[];
}

export class ItemsViewSource<TDto> implements IItemsViewSource<TDto> {
  sort!: Sort;
  paginator!: IPaginator;
  filter!: IFilter;
  schema: ItemSchema[] = [];
  data!: TDto[];

  get modelColumns(): string[] { return this.schema.map((col) => col.key); }
  get displayColumns(): string[] { return this.schema.map((col) => col.label); }
}

/**
 * Describes the data model schema and how/if to be dispalyed.
 * If 'type' is 'button' or 'link', the key is used to identify the button or link.
 */
export class ItemSchema {
  /** Actual object model's member/property name. */
  key: any;
  /** Display friendly string for identifying the data model member in the column header */
  label: string = '';
  /** Used to add a button or link to the schema.  Link requires authorized: true to be enabled. */
  type?: 'button' | 'link' | 'boolean' | 'string' = 'string';
  /** Used for displaying tooltips in column headers. */
  description?: string = '';
  /** Used to give tooltips for button and link types. */
  toolTip?: string = '';
  /** Appended to toolTip for button and link types.  Set it to a member of the data model. */
  itemName?: string = '';
  /** Required to make button columns show and link types to be enabled. */
  authorized?: boolean = false;
  /** Used with numeric columns to format them with commas. */
  pipeToNumber?: boolean = false;
  /** For when the data model member is an array.  Pipes to a join using the value as the separator. */
  join?: string;
  /** Hides the column by filtering it out. */
  hidden?: boolean = false;
  /** Prevents sorting on the column. The button type is automatically not sortable. */
  noSort?: boolean = false;
}
