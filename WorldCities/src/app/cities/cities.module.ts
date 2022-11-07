import { NgModule } from '@angular/core';

import { SharedModule } from '@app/_shared/shared.module';

import { CitiesComponent } from './cities/cities.component';
import { CityComponent } from './city/city.component';
import { CityEditComponent } from './city-edit/city-edit.component';
import { CitiesRoutingModule } from './cities-routing.module';
import { CityService } from '@app/_services';

import { RouteReuseStrategy } from '@angular/router';
import { WCReuseStrategy } from '@app/_helpers/wc-reuse-strategy';

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
    { provide: RouteReuseStrategy, useClass: WCReuseStrategy },
    CityService
  ]
})
export class CitiesModule { }
