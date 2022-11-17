export interface IItemsViewSource<TDto> {
  /** Gets a string array of the model's property names from the schema */
  get modelColumns(): string[];
  /** Gets a string array of column labels from the schema */
  get displayColumns(): string[];
  defaultSortColumn: string;
  defaultSortOrder: '' | 'asc' | 'desc';
  schema: any[];
  data: TDto[];
}

export class ItemsViewSource<TDto> implements IItemsViewSource<TDto> {
  defaultSortColumn: string = '';
  defaultSortOrder: '' | 'asc' | 'desc' = 'asc';

  schema: any[] = [];
  data!: TDto[];

  get modelColumns(): string[] { return this.schema.map((col) => col.key); }
  get displayColumns(): string[] { return this.schema.map((col) => col.label); }
}
