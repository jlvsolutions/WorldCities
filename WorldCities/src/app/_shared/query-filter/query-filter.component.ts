import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IQueryFilter, FilterEvent, FilterColumn } from '@app/_models';

/** Provides a debounced query filter */
@Component({
  selector: 'query-filter',
  templateUrl: './query-filter.component.html',
  styleUrls: ['./query-filter.component.scss']

})
export class QueryFilterComponent implements OnInit, IQueryFilter, AfterViewInit {
  form!: FormGroup;

  @Input() query: string = '';
  @Input() column: string = '';
  @Input() columns: FilterColumn[] = [];
  @Input() placeholder: string = '';
  /** EventEmitter that fires when the filter query text changes. */
  @Output() filterChange: EventEmitter<FilterEvent> = new EventEmitter<FilterEvent>();
  /** Private Subject used for debouncing */
  private filterTextChanged: Subject<string> = new Subject<string>();

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    console.log(`QueryFilterComponent OnInit: query=${this.query}, column=${this.column}`);
    this.form = this.formBuilder.group({
      query: [this.query, Validators.pattern(/^[a-zA-Z0-9.-\s~`']+$/)],
      columns: [this.column]
    });
    this.setPlaceholder();
  }

  ngAfterViewInit(): void {
    console.log(`QueryFilterComponent AfterViewInit. query=${this.query}, column=${this.column}`);
  }

  /** Debounce filter text changes */
  onKeyUp(searchText: string) {
    console.log(`QueryFilter: onKeyUp: ${searchText}`);

    this.form.markAllAsTouched();

    if (!this.form.valid) {
      return;
    }
    if (this.filterTextChanged.observers.length === 0) {
      this.filterTextChanged
        .pipe(debounceTime(200), distinctUntilChanged())
        .subscribe(query => {
          console.log(`QueryFilter: onKeyUp Emitting: ${this.column}, ${query}`);
          this.filterChange.emit({ column: this.column, query: query});
        })
    }
    this.query = searchText;
    this.filterTextChanged.next(searchText);
  }

  onSelectionChange(event: MatSelectChange) {
    console.log(`QueryFilter: onSelectionChange: ${event.value}`);
    this.column = event.value;
    this.form.controls['query'].setValue('');
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
}
