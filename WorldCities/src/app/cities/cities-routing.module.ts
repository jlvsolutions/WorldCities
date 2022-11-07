import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGaurd } from '@app/_helpers/auth.guard';

import { CitiesComponent } from './cities/cities.component';
import { CityComponent } from './city/city.component';
import { CityEditComponent } from './city-edit/city-edit.component';

const routes: Routes = [
  //{ path: '', redirectTo: 'cities', pathMatch: 'full' },
  { path: '', component: CitiesComponent, pathMatch: 'full', data: { saveComponent: true } },
  { path: 'edit/:id', component: CityEditComponent, canActivate: [AuthGaurd] },
  { path: 'edit', component: CityEditComponent, canActivate: [AuthGaurd] },
  { path: ':id', component: CityComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CitiesRoutingModule { }
