import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { AuthGaurd } from '@app/_helpers/auth.guard';
import { AdminAuthGaurd } from '@app/_helpers/admin-auth.guard';
import { HomeComponent } from '@app/home/home/home.component';
import { LoginComponent } from '@app/auth/login/login.component';
import { RegisterComponent } from '@app/auth/register/register.component';
import { UsersComponent } from '@app/users/users/users.component';
import { UserEditComponent } from '@app/users/user-edit/user-edit.component';

const routes: Routes = [
  { path: '', data: { title: 'Home' }, component: HomeComponent, pathMatch: 'full' },
  { path: 'cities', loadChildren: () => import('@app/cities/cities.module').then(m => m.CitiesModule) },
  { path: 'countries', loadChildren: () => import('@app/countries/countries.module').then(m => m.CountriesModule) },
  { path: 'users', data: { title: 'Users' }, component: UsersComponent, canActivate: [AdminAuthGaurd] },
  { path: 'user/:id', component: UserEditComponent, canActivate: [AdminAuthGaurd] },
  { path: 'user', component: UserEditComponent, canActivate: [AdminAuthGaurd] },
  { path: 'login', data: { title: 'Login' }, component: LoginComponent },
  { path: 'register', data: { title: 'Register' }, component: RegisterComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
