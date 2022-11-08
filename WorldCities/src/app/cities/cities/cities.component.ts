import { Component } from '@angular/core';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { City } from '@app/_models';
import { CityService, AuthService } from '@app/_services';

@Component({
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss']
})
export class CitiesComponent extends BaseItemsComponent<City, number> {

  constructor(authService: AuthService, cityService: CityService) {
    super(authService, cityService);
    console.log('CitiesComponent instance created.');
    this.displayedColumns = ['id', 'name', 'lat', 'lon', 'population', 'countryName'];
    this.defaultSortColumn = 'name';
    this.defaultFilterColumn = 'name';
  }
}
