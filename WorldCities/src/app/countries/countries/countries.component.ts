import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { Country, DetailEvent, ItemSchema } from '@app/_models';
import { CountryService, AuthService } from '@app/_services';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']
})
export class CountriesComponent extends BaseItemsComponent<Country, number> {

  constructor(
    cd: ChangeDetectorRef,
    router: Router,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    countryService: CountryService) {
    super(cd, router, activatedRoute, authService, countryService);
    console.log('CountriesComponent instance created.');

    this.title = 'Countries';
  }

  getItemSchema(): ItemSchema[] {
    console.log(`CountriesComponent:  Setting schema. isLoggedIn:  ${this.isLoggedIn}, isAdministrator:  ${this.isAdministrator}`);
    return [
      { key: 'id', label: 'ID', description: 'The database ID of the country.' },
      {
        key: 'delete', label: 'Delete', type: 'button',
        toolTip: 'Delete ', itemName: 'name', hidden: !this.isAdministrator
      },
      {
        key: 'edit', label: 'Edit', type: 'button',
        toolTip: 'Edit ', itemName: 'name', hidden: !this.isLoggedIn
      },
      { key: 'name', label: 'Name', description: 'The name of the country.' },
      { key: 'iso2', label: 'ISO2', description: 'The alpha-2 iso code of the country.'},
      { key: 'iso3', label: 'ISO3', description: 'The alpha-3 iso code of the country.' },
      { key: 'capitalId', label: 'Capital ID', description: 'The database ID for the capital city/town of the country.' },
      { key: 'capitalName', label: 'Capital Name', description: 'The name of the capital city/town' },
      {
        key: 'totAdminRegions', label: 'Total Administration Regions',
        description: 'The total number of administration regions in the country.'
      },
      {
        key: 'totCities', label: 'Total Cities', description: 'The total number of cities in the country.',
        type: 'link', toolTip: 'View list of cities in ', itemName: 'name',
        authorized: true
      }
    ];
  }

  getDefaultColumn(): string {
    return 'name';
  }

  getNameOfItem(id: number): string {
    return this.viewSource.data.find((item: { id: number }) => item.id == id)?.name ?? '';
  }

  onDetailClick(detail: DetailEvent) {
    console.log(`CountriesComponent:  onDetailClick(${detail.key}, ${detail.row.id})`);
    switch (detail.key) {
      case 'delete':
        this.deleteItem(detail.row.id);
        break;
      case 'edit':
        this.router.navigate(['edit', detail.row.id], { relativeTo: this.activatedRoute });
        break;
      case 'totCities':
        this.router.navigate(['cities'], {
          queryParams: { Country: detail.row.id, sortColumn: 'name' }
        });
        break;
      default:
        console.error(`Invalid button click event: ${detail.key} ${detail.row.id}.`);
        break;
    }
  }

  onRowClick(row: Country) {
    console.log(`ContriesComponent onRowClick: Country Name=${row.name}`);
    this.router.navigate([row.id], {
      queryParams: { returnUrl: this.router.routerState.snapshot.url },
      relativeTo: this.activatedRoute
    });
  }

  getRowToolTip(row: Country) {
    return `View details and map of ${row.name}`;
  }

  onParamsChanged(params: Params): void { }
}
