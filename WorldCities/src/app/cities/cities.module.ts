import { NgModule } from '@angular/core';

import { SharedModule } from '@app/_shared/shared.module';

import { CitiesComponent } from './cities/cities.component';
import { CityComponent } from './city/city.component';
import { CityEditComponent } from './city-edit/city-edit.component';
import { CitiesRoutingModule } from './cities-routing.module';
import { CityService } from '@app/_services';

@NgModule({
  declarations: [
    CitiesComponent,
    CityComponent,
    CityEditComponent
  ],
  imports: [
    SharedModule,
    CitiesRoutingModule
  ],
  exports: [
    CitiesComponent,
    CityComponent,
    CityEditComponent
  ],
  providers: [
    CityService
  ]
})
export class CitiesModule { }
