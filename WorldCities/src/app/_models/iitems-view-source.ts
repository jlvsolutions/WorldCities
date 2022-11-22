export interface IItemsViewSource<TDto> {
  /** Gets a string array of the model's property names from the schema */
  get modelColumns(): string[];
  /** Gets a string array of column labels from the schema */
  get displayColumns(): string[];
  defaultSortColumn: string;
  defaultSortOrder: '' | 'asc' | 'desc';
  schema: DataMemberSchema[];
  data: TDto[];
}

export class ItemsViewSource<TDto> implements IItemsViewSource<TDto> {
  defaultSortColumn: string = '';
  defaultSortOrder: '' | 'asc' | 'desc' = 'asc';

  schema: DataMemberSchema[] = [];
  data!: TDto[];

  get modelColumns(): string[] { return this.schema.map((col) => col.key); }
  get displayColumns(): string[] { return this.schema.map((col) => col.label); }
}

export class DataMemberSchema {
  /** Identifies which member of the data model this entry refers to.
   * If 'type' is 'button' or 'link', the key is used to identify the button or link.
   */
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
