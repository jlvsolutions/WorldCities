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
export class QueryFilterComponent implements OnInit, IQueryFilter {
  form!: FormGroup;

  @Input() query: string = '';
  @Input() column: string = '';
  @Input() columns: FilterColumn[] = [];
  @Input() placeholder: string = '';
  @Output() filterChange: EventEmitter<FilterEvent> = new EventEmitter<FilterEvent>();

  private filterTextChanged: Subject<string> = new Subject<string>();

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      query: [this.query, Validators.pattern(/^[a-zA-Z0-9.-\s~`']+$/)],
      columns: [this.column]
    });
    this.setPlaceholder();
  }

  /** Debounce filter text changes */
  onKeyUp(searchText: string) {
    this.form.markAllAsTouched();

    if (!this.form.valid)
      return;

    if (this.filterTextChanged.observers.length === 0) {
      this.filterTextChanged
        .pipe(debounceTime(400), distinctUntilChanged())
        .subscribe(query => {
          this.query = query;
          this.filterChange.emit({column: this.column, query: this.query});
        })
    }
    this.filterTextChanged.next(searchText);
  }

  onSelectionChange(event: MatSelectChange) {
    this.column = event.value;
    this.setPlaceholder();
    if (this.form.valid)
      this.filterChange.emit({ column: this.column, query: this.query });
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
