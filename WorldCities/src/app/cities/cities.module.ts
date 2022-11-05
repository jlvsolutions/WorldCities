import { NgModule } from '@angular/core';

import { SharedModule } from '@app/_shared/shared.module';

import { CitiesComponent } from './cities/cities.component';
import { CityComponent } from './city/city.component';
import { CityEditComponent } from './city-edit/city-edit.component';



@NgModule({
  declarations: [
    CitiesComponent,
    CityComponent,
    CityEditComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    CitiesComponent,
    CityComponent,
    CityEditComponent
  ]
})
export class CitiesModule { }
