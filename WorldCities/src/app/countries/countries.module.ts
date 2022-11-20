import { NgModule } from '@angular/core';

import { SharedModule } from '@app/_shared/shared.module';

import { CountriesComponent } from './countries/countries.component';
import { CountryEditComponent } from './country-edit/country-edit.component';
import { CountriesRoutingModule } from './countries-routing.module';
import { CountryService } from '@app/_services';

import { RouteReuseStrategy } from '@angular/router';
import { WCReuseStrategy } from '@app/_helpers/wc-reuse-strategy';
import { CountryComponent } from './country/country.component';


@NgModule({
  declarations: [
    CountriesComponent,
    CountryEditComponent,
    CountryComponent
  ],
  imports: [
    SharedModule,
    CountriesRoutingModule
  ],
  exports: [
    CountriesComponent,
    CountryEditComponent
  ],
  providers: [
    CountryService
  ]
})
export class CountriesModule { }
