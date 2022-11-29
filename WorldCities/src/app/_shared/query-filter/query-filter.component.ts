import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IQueryFilter } from '@app/_models';

/** Provides a debounced query filter */
@Component({
  selector: 'app-query-filter',
  templateUrl: './query-filter.component.html',
  styles: [`
    .query-filter-form-field {
      width: 100%;
    }
    .filter-icon {
      cursor: pointer;
    }
`]
})
export class QueryFilterComponent implements OnInit, IQueryFilter {
  form!: FormGroup;

  @Input() filterText: string = '';
  @Input() filterColumn?: string;
  @Input() Columns?: string[];
  @Input() placeholder: string = 'Enter filter text...';
  @Output() filterChange: EventEmitter<string> = new EventEmitter<string>();

  private filterTextChanged: Subject<string> = new Subject<string>();

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      query: [this.filterText, Validators.pattern(/^[a-zA-Z0-9.-\s~`']+$/)]
    });
  }

  /** Debounce filter text changes */
  onKeyUp(searchText: string) {
    this.form.markAllAsTouched();
    if (this.filterTextChanged.observers.length === 0) {
      this.filterTextChanged
        .pipe(debounceTime(400), distinctUntilChanged())
        .subscribe(query => {
          this.filterText = query;
          this.filterChange.emit(query);
        })
    }
    this.filterTextChanged.next(searchText);
  }

}
