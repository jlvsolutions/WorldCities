import { Component } from '@angular/core';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { Country } from '@app/_models';
import { CountryService, AuthService } from '@app/_services';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']
})
export class CountriesComponent extends BaseItemsComponent<Country, number> {

  constructor(authService: AuthService, countryService: CountryService) {
    super(authService, countryService);
    console.log('CountriesComponent instance created.');
    this.displayedColumns = ['id', 'name', 'iso2', 'iso3', 'totCities'];
    this.defaultSortColumn = 'name';
    this.defaultFilterColumn = 'name';
  }
}
