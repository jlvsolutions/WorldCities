import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@app/_shared/shared.module';

import { CountriesComponent } from './countries/countries.component';
import { CountryEditComponent } from './country-edit/country-edit.component';



@NgModule({
  declarations: [
    CountriesComponent,
    CountryEditComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    CountriesComponent,
    CountryEditComponent
  ]
})
export class CountriesModule { }
