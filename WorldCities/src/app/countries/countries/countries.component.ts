import { Component } from '@angular/core';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { Country } from '@app/_models';
import { CountryService, AuthService } from '@app/_services';

const SCHEMA = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'lat', label: 'Latitude' },
  { key: 'lon', label: 'Longitude' },
  { key: 'population', label: 'Population', type: 'number' },
  { key: 'countryName', label: 'Country', link: '/countries/', linkId: 'countryId' },
];
@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']
})
export class CountriesComponent extends BaseItemsComponent<Country, number> {

  constructor(authService: AuthService, countryService: CountryService) {
    super(authService, countryService);
    console.log('CountriesComponent instance created.');
    this.modelColumns = ['id', 'name', 'iso2', 'iso3', 'totCities'];
    this.displayColumns = ['Id', 'Name', 'ISO 2', 'ISO 3', '# of Cities']
    this.defaultSortColumn = 'name';
    this.defaultFilterColumn = 'name';
  }
}
