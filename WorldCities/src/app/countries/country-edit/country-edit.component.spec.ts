import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';

import { SharedModule } from '@app/_shared';

import { CountryService } from '@app/_services';
import { CountryEditComponent } from './country-edit.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CountryEditComponent', () => {
  let component: CountryEditComponent;
  let fixture: ComponentFixture<CountryEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [CountryEditComponent],
    imports: [RouterTestingModule,
        NoopAnimationsModule,
        SharedModule],
    providers: [
        FormBuilder,
        CountryService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
