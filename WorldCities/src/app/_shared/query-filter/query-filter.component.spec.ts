import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';

import { QueryFilterComponent } from './query-filter.component';

describe('QueryFilterComponent', () => {
  let component: QueryFilterComponent;
  let fixture: ComponentFixture<QueryFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QueryFilterComponent],
      providers: [FormBuilder]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
