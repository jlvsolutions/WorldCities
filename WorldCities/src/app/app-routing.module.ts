import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CitiesComponent } from './cities/cities.component';
import { CityEditComponent } from './cities/city-edit.component';
import { CountriesComponent } from './countries/countries.component';
import { CountryEditComponent } from './countries/country-edit.component';
import { LoginComponent } from './auth/login.component';
import { AuthGaurd } from './auth/auth.guard';
import { RegisterComponent } from './auth/register.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'cities', component: CitiesComponent },
  { path: 'city/:id', component: CityEditComponent, canActivate: [AuthGaurd] },
  { path: 'city', component: CityEditComponent, canActivate: [AuthGaurd] },
  { path: 'countries', component: CountriesComponent },
  { path: 'country/:id', component: CountryEditComponent, canActivate: [AuthGaurd] },
  { path: 'country', component: CountryEditComponent, canActivate: [AuthGaurd] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
