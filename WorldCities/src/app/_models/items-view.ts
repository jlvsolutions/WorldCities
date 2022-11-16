export interface IItemsView {
  modelColumns: string[];
  displayColumns: string[];
  defaultSortColumn: string;
  defaultSortOrder: '' | 'asc' | 'desc';
  data: any[];
}

export class ItemsViewData<TDto> implements IItemsView {
  modelColumns: string[] = [];
  displayColumns: string[] = [];
  defaultSortColumn: string = '';
  defaultSortOrder: '' | 'asc' | 'desc' = 'asc';
  data!: TDto[];
}

export interface IViewSource {
  get modelColumns(): string[];
  get displayColumns(): string[];
  defaultSortColumn: string;
  defaultSortOrder: '' | 'asc' | 'desc';
  schema: any[];
  data: any[];
}
export class ItemsViewSource<TDto> implements IViewSource {
  defaultSortColumn: string = '';
  defaultSortOrder: '' | 'asc' | 'desc' = 'asc';

  schema: any[] = [];
  data!: TDto[];

  /** Gets a string array of the model's property names from the schema */
  get modelColumns(): string[] { return this.schema.map((col) => col.key); }
  /** Gets a string array of column labels from the schema */
  get displayColumns(): string[] { return this.schema.map((col) => col.label); }
}
