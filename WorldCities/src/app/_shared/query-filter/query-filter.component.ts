import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IQueryFilter, FilterEvent, FilterColumn } from '@app/_models';

/** Provides a debounced query filter */
@Component({
  selector: 'app-query-filter',
  templateUrl: './query-filter.component.html',
  styles: [`
    .query-filter {
      display: flex;
      flex-basis: 100%;
      align-items: center;
    }
    .query-input {
      flex-basis: 80%;
    }
    .query-select {
      margin-left: 10px;
      flex-basis: 20%;
     }
    .filter-icon {
      cursor: pointer;
    }
`]
})
export class QueryFilterComponent implements OnInit, IQueryFilter {
  form!: FormGroup;

  @Input() filterText: string = '';
  @Input() filterColumn: string = '';
  @Input() columns: FilterColumn[] = [];
  @Input() placeholder: string = '';
  @Output() filterChange: EventEmitter<FilterEvent> = new EventEmitter<FilterEvent>();

  private filterTextChanged: Subject<string> = new Subject<string>();

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      query: [this.filterText, Validators.pattern(/^[a-zA-Z0-9.-\s~`']+$/)],
      columns: [this.filterColumn]
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
          this.filterText = query;
          this.filterChange.emit({column: this.filterColumn, query: this.filterText});
        })
    }
    this.filterTextChanged.next(searchText);
  }

  onSelectionChange(event: MatSelectChange) {
    this.filterColumn = event.value;
    this.setPlaceholder();
    if (this.form.valid)
      this.filterChange.emit({ column: this.filterColumn, query: this.filterText });
  }

  private setPlaceholder() {
    if (this.filterColumn) {
      let by = this.columns.find(c => c.col === this.filterColumn)?.label;
      this.placeholder = `Filter by ${by} (or part of it...)`;
    }
    else
      this.placeholder = 'Enter filter text...';
  }
}
