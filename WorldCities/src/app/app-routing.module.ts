import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGaurd } from '@app/_helpers/auth.guard';
import { AdminAuthGaurd } from '@app/_helpers/admin-auth.guard';
import { CitiesComponent } from '@app/cities/cities/cities.component';
import { HomeComponent } from '@app/home/home/home.component';
import { CountriesComponent } from '@app/countries/countries/countries.component';
import { CountryEditComponent } from '@app/countries/country-edit/country-edit.component';
import { LoginComponent } from '@app/auth/login/login.component';
import { RegisterComponent } from '@app/auth/register/register.component';
import { UsersComponent } from '@app/users/users/users.component';
import { UserEditComponent } from '@app/users/user-edit/user-edit.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'cities', loadChildren: () => import('@app/cities/cities.module').then(m => m.CitiesModule) },
  //{ path: 'cities', component: CitiesComponent, data: { saveComponent: true } },
  { path: 'countries', component: CountriesComponent },
  { path: 'country/:id', component: CountryEditComponent, canActivate: [AuthGaurd] },
  { path: 'country', component: CountryEditComponent, canActivate: [AuthGaurd] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'users', component: UsersComponent, canActivate: [AdminAuthGaurd] },
  { path: 'user/:id', component: UserEditComponent, canActivate: [AdminAuthGaurd] },
  { path: 'user', component: UserEditComponent, canActivate: [AdminAuthGaurd] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
