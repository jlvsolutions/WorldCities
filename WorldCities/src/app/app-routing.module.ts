import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';

import { RegisterComponent } from './auth/register.component';
import { LoginComponent } from './auth/login.component';
import { AuthGaurd } from './_helpers/auth.guard';
import { AdminAuthGaurd } from './_helpers/admin-auth.guard';

import { CitiesComponent } from './cities/cities.component';
import { CityComponent } from './city/city.component';
import { CityEditComponent } from './cities/city-edit.component';

import { CountriesComponent } from './countries/countries.component';
import { CountryEditComponent } from './countries/country-edit.component';

import { UsersComponent } from './users/users.component';
import { UserEditComponent } from './users/user-edit.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'cities', component: CitiesComponent, data: { saveComponent: true } },
  { path: 'city/:id', component: CityComponent },
  { path: 'cityedit/:id', component: CityEditComponent, canActivate: [AuthGaurd] },
  { path: 'cityedit', component: CityEditComponent, canActivate: [AuthGaurd] },
  { path: 'countries', component: CountriesComponent },
  { path: 'country/:id', component: CountryEditComponent, canActivate: [AuthGaurd] },
  { path: 'country', component: CountryEditComponent, canActivate: [AuthGaurd] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'users', component: UsersComponent, canActivate: [AdminAuthGaurd] },
  { path: 'user/:id', component: UserEditComponent, canActivate: [AdminAuthGaurd] },
  { path: 'user', component: UserEditComponent, canActivate: [AdminAuthGaurd] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
