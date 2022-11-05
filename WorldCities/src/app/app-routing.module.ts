import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGaurd } from './_helpers/auth.guard';
import { AdminAuthGaurd } from './_helpers/admin-auth.guard';

import { HomeComponent } from '@app/home/home/home.component';
import { CitiesComponent } from '@app/cities/cities/cities.component';
import { CityComponent } from '@app/cities/city/city.component';
import { CityEditComponent } from '@app/cities/city-edit/city-edit.component';
import { CountriesComponent } from '@app/countries/countries/countries.component';
import { CountryEditComponent } from '@app/countries/country-edit/country-edit.component';
import { LoginComponent } from '@app/auth/login/login.component';
import { RegisterComponent } from '@app/auth/register/register.component';
import { UsersComponent } from '@app/users/users/users.component';
import { UserEditComponent } from '@app/users/user-edit/user-edit.component';

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
  { path: 'user', component: UserEditComponent, canActivate: [AdminAuthGaurd] },
  { path: '**', redirectTo: '' }
  //{ path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
