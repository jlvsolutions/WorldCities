import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGaurd } from '@app/_helpers/auth.guard';

import { CitiesComponent } from './cities/cities.component';
import { CityComponent } from './city/city.component';
import { CityEditComponent } from './city-edit/city-edit.component';

const routes: Routes = [
  { path: '', data: { title: 'List Cities', saveComponent: true }, component: CitiesComponent, pathMatch: 'full'},
  { path: 'edit/:id', data: { title: 'Edit City' }, component: CityEditComponent, canActivate: [AuthGaurd] },
  { path: 'edit', data: { title: 'Add City' }, component: CityEditComponent, canActivate: [AuthGaurd] },
  { path: ':id', data: { title: 'Display City' }, component: CityComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CitiesRoutingModule { }
