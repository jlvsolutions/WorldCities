import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IQueryFilter, FilterEvent, FilterColumn } from '@app/_models';

/** Provides a debounced query filter */
@Component({
  selector: 'query-filter',
  templateUrl: './query-filter.component.html',
  styleUrls: ['./query-filter.component.scss']

})
export class QueryFilterComponent implements IQueryFilter, OnInit, IQueryFilter, AfterViewInit {
  form!: FormGroup;

  @Input() query: string = '';
  @Input() column: string = '';
  @Input() columns: FilterColumn[] = [];
  @Input() placeholder: string = '';
  /** EventEmitter that fires when the filter query text changes. */
  @Output() filterChange: EventEmitter<FilterEvent> = new EventEmitter<FilterEvent>();

  /** Private Subject used for debouncing */
  private filterTextChanged: Subject<string> = new Subject<string>();
  private loggingEnabled: boolean = true;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.log(`OnInit: query=${this.query}, column=${this.column}`);
    this.form = this.formBuilder.group({
      query: [this.query, Validators.pattern(/^[a-zA-Z0-9.-\s~`']+$/)],
      columns: [this.column]
    });
    this.setPlaceholder();
  }

  ngAfterViewInit(): void {
    this.log(`AfterViewInit. query=${this.query}, column=${this.column}`);
  }

  /** Debounce filter text changes */
  onKeyUp(searchText: string) {
    this.log(`onKeyUp: ${searchText}`);

    this.form.markAllAsTouched(); // Triggers validation.
    if (!this.form.valid)
      return;

      if (this.filterTextChanged.observers.length === 0) {
      this.filterTextChanged
        .pipe(debounceTime(200), distinctUntilChanged())
        .subscribe(query => {
          this.log(`onKeyUp Emitting: ${this.column}, ${query}`);
          this.filterChange.emit({ column: this.column, query: query});
        })
    }
    this.query = searchText;
    this.filterTextChanged.next(searchText);
  }

  onSelectionChange(event: MatSelectChange) {
    this.log(`onSelectionChange: ${event.value}`);
    this.column = event.value;
    this.query = '';
    this.setPlaceholder();
    if (this.form.valid)
      this.filterChange.emit({ column: event.value, query: this.query });
  }

  private setPlaceholder() {
    if (this.column) {
      let by = this.columns.find(c => c.col === this.column)?.label;
      this.placeholder = `Filter by ${by} (or part of it...)`;
    }
    else
      this.placeholder = 'Enter filter text...';
  }

  private log(msg: string): void {
    if (this.loggingEnabled)
      console.log(`queryFilterComponent:  ${msg}`);
  }
}
