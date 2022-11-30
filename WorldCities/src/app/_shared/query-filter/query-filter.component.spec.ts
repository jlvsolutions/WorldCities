import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@app/_shared'
import { FormBuilder } from '@angular/forms';
import { HarnessLoader } from '@angular/cdk/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatIconHarness } from '@angular/material/icon/testing';
import { FilterEvent } from '@app/_models';

import { QueryFilterComponent } from './query-filter.component';

let loader: HarnessLoader;

describe('QueryFilterComponent', () => {
  let component: QueryFilterComponent;
  let fixture: ComponentFixture<QueryFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule,
        NoopAnimationsModule
      ],
      declarations: [QueryFilterComponent],
      providers: [FormBuilder]
    })
      .compileComponents();
    fixture = TestBed.createComponent(QueryFilterComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  beforeEach(() => {
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it ('setting ')
  it('setting filterText shows in input', async () => {
    const queryInput = await loader.getHarness(MatInputHarness);
    component.filterText = 'Boerne';
    fixture.detectChanges();
    const queryValue = await queryInput.getValue();
    expect(queryValue).toBe('Boerne');
  });

  it('typing in query should emit query text', async () => {
    const queryInput = await loader.getHarness(MatInputHarness);

    spyOn(component.filterChange, 'emit');
    await queryInput.setValue('bulverde');
    expect(component.filterChange.emit).toHaveBeenCalledOnceWith({ query: 'bulverde', column: '' });
  });

});
