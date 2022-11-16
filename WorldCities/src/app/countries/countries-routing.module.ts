import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGaurd } from '@app/_helpers/auth.guard';

import { CountriesComponent } from './countries/countries.component';
import { CountryEditComponent } from './country-edit/country-edit.component';
import { CountryComponent } from './country/country.component';

const routes: Routes = [
  { path: '', data: { title: 'List Countries', saveComponent: true }, component: CountriesComponent, pathMatch: 'full' },
  { path: 'edit/:id', data: { title: 'Edit Country' }, component: CountryEditComponent, canActivate: [AuthGaurd] },
  { path: 'edit', data: { title: 'Add Country' }, component: CountryEditComponent, canActivate: [AuthGaurd] },
  { path: ':id', data: { title: 'Display Country' }, component: CountryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CountriesRoutingModule { }
