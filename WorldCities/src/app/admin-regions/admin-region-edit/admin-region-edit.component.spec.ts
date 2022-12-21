import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRegionEditComponent } from './admin-region-edit.component';

describe('AdminRegionEditComponent', () => {
  let component: AdminRegionEditComponent;
  let fixture: ComponentFixture<AdminRegionEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminRegionEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRegionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
