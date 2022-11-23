import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IQueryFilter } from '@app/_models';

/** Provides a debounced query filter */
@Component({
  selector: 'app-query-filter',
  template: `
  <div class="query-filter">
    <form [formGroup]="form">
      <mat-form-field class="query-filter-form-field">
      
        <input matInput formControlName="query" #filter (keyup)="onKeyUp(filter.value)"
               [placeholder]="placeholder"
               [value]="filterText">
        <mat-icon matSuffix class="filter-icon" (click)="filter.value=''; onKeyUp('')">clear_text</mat-icon>
        <mat-error *ngIf="form.controls['query'].errors?.['pattern']">Invalid characters entered.</mat-error>
      </mat-form-field>
    </form>
  </div>
`,
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

  @Input() filterText: string = '';
  @Input() filterColumn: string = '';
  @Input() Columns: string[] = [];
  @Input() placeholder: string = 'Enter filter text...';
  @Output() search: EventEmitter<string> = new EventEmitter<string>();
  private filterTextChanged: Subject<string> = new Subject<string>();
  form!: FormGroup;

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
          this.search.emit(query);
        })
    }
    this.filterTextChanged.next(searchText);
  }

}
