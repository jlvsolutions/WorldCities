import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/** Provides a debounced query filter */
@Component({
  selector: 'app-filter-query',
  template: `
  <div class="filter-query">
    <form [formGroup]="form">
      <mat-form-field class="filter-query-form-field">
        <input matInput formControlName="query" #filter (keyup)="onKeyUp(filter.value)"
               placeholder={{placeholder}}
               [value]="filterText">
        <mat-icon matSuffix (click)="filter.value=''; onKeyUp('')">clear_text</mat-icon>
        <mat-error *ngIf="form.controls['query'].errors?.['pattern']">Invalid characters entered.</mat-error>
      </mat-form-field>
    </form>
  </div>
`,
  styles: [`
    .filter-query-form-field {
      width: 100%;
    }
`]
})
export class FilterQueryComponent implements OnInit {

  @Input() filterText: string = '';
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
    console.log(`onKeyUp:  control is errors = ${this.form.controls['query'].errors}`);
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
