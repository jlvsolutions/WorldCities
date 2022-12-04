/** An event emitted when clicking on detail in a colletion view. */
export class DetailEvent {
  /** The key of the detail. */
  key: string = '';
  /** The row of data */
  row: any;
}

export class RowMouseOverEvent {
  event: any;
  row: any;
}
