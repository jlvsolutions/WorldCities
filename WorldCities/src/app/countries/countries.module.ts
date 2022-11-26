import { NgModule } from '@angular/core';

import { SharedModule } from '@app/_shared/shared.module';

import { CountriesComponent } from './countries/countries.component';
import { CountryComponent } from './country/country.component';
import { CountryEditComponent } from './country-edit/country-edit.component';
import { CountriesRoutingModule } from './countries-routing.module';
import { CountryService } from '@app/_services';



@NgModule({
  declarations: [
    CountriesComponent,
    CountryComponent,
    CountryEditComponent
  ],
  imports: [
    SharedModule,
    CountriesRoutingModule
  ],
  exports: [
    CountriesComponent,
    CountryComponent,
    CountryEditComponent
  ],
  providers: [
    CountryService
  ]
})
export class CountriesModule { }
