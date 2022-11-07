import { NgModule } from '@angular/core';

import { SharedModule } from '@app/_shared/shared.module';

import { CountriesComponent } from './countries/countries.component';
import { CountryEditComponent } from './country-edit/country-edit.component';
import { CountriesRoutingModule } from './countries-routing.module';

import { RouteReuseStrategy } from '@angular/router';
import { WCReuseStrategy } from '@app/_helpers/wc-reuse-strategy';


@NgModule({
  declarations: [
    CountriesComponent,
    CountryEditComponent
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
    { provide: RouteReuseStrategy, useClass: WCReuseStrategy }
  ]
})
export class CountriesModule { }
