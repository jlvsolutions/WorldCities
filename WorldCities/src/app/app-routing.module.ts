import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { AdminAuthGaurd } from '@app/_helpers/admin-auth.guard';
import { HomeComponent } from '@app/home/home/home.component';
import { LoginComponent } from '@app/auth/login/login.component';
import { RegisterComponent } from '@app/auth/register/register.component';

const routes: Routes = [
  { path: '', data: { title: 'Home' }, component: HomeComponent, pathMatch: 'full' },
  { path: 'cities', data: { title: 'app-root-cities' }, loadChildren: () => import('@app/cities/cities.module').then(m => m.CitiesModule) },
  { path: 'countries', data: { title: 'app-root-countries' }, loadChildren: () => import('@app/countries/countries.module').then(m => m.CountriesModule) },
  { path: 'adminregions', data: { title: 'app-root-adminregions' }, loadChildren: () => import('@app/admin-regions/admin-regions.module').then(m => m.AdminRegionsModule) },
  { path: 'users', data: { title: 'app-root-users' }, loadChildren: () => import('@app/users/users.module').then(m => m.UsersModule), canActivate: [AdminAuthGaurd] },
  { path: 'login', data: { title: 'Login' }, component: LoginComponent },
  { path: 'register', data: { title: 'Register' }, component: RegisterComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
