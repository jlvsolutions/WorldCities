import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { Country } from '@app/_models';
import { CountryService, AuthService } from '@app/_services';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']
})
export class CountriesComponent extends BaseItemsComponent<Country, number> {

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    countryService: CountryService) {
    super(router, activatedRoute, authService, countryService);
    console.log('CountriesComponent instance created.');

    this.defaultSortColumn = 'name';
    this.defaultFilterColumn = 'name';
    this.sort = { direction: this.defaultSortOrder, active: 'name' };
  }

  defineSchema(): any[] {
    console.log(`CountriesComponent:  Setting schema. isLoggedIn:  ${this.isLoggedIn}, isAdministrator:  ${this.isAdministrator}`);
    return [
      { key: 'id', label: 'ID', description: 'The database ID of the country.' },
      {
        key: 'delete', label: 'Delete', type: 'button', param: 'id',
        toolTip: 'Delete ', itemName: 'name', authorized: this.isAdministrator
      },
      {
        key: 'edit', label: 'Edit', type: 'button', param: 'id',
        toolTip: 'Edit ', itemName: 'name', authorized: this.isLoggedIn
      },
      { key: 'name', label: 'Name', description: 'The name of the country.' },
      { key: 'iso2', label: 'ISO2', description: 'The alpha-2 iso code of the country.'},
      { key: 'iso3', label: 'ISO3', description: 'The alpha-3 iso code of the country.' },
      { key: 'totCities', label: 'Total Cities', description: 'The total number of cities in the country.'}
    ];
  }

  nameOfItem(id: number): string {
    return this.viewSource.data.find((item: { id: number }) => item.id == id)?.name ?? '';
  }

  onItemButClick(event: any) {
    console.log(`CountriesComponent:  onItemButClick(${event.key}, ${event.id})`);
    switch (event.key) {
      case 'delete':
        this.deleteItem(+event.id);
        break;
      case 'edit':
        this.router.navigate(['edit', event.id], { relativeTo: this.activatedRoute });
        break;
      default:
        console.error(`Invalid button click event: ${event.key} ${event.id}.`);
    }
  }
}
