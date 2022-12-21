import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRegionComponent } from './admin-region.component';

describe('AdminRegionComponent', () => {
  let component: AdminRegionComponent;
  let fixture: ComponentFixture<AdminRegionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminRegionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
