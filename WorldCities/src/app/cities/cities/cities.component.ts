import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { City, DetailEvent, ItemSchema } from '@app/_models';
import { CityService, AuthService } from '@app/_services';

@Component({
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss']
})
export class CitiesComponent extends BaseItemsComponent<City, number> {

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    cityService: CityService) {
    super(router, activatedRoute, authService, cityService);
    console.log('CitiesComponent instance created.');

    this.title = 'Cities';
  }

  getItemSchema(): ItemSchema[] {
    console.log(`CitiesComponent:  Setting schema. isLoggedIn:  ${this.isLoggedIn}, isAdministrator:  ${this.isAdministrator}`);
    return [
      { key: 'id', label: 'ID', description: 'The database ID of the city/town.' },
      {
        key: 'delete', label: 'Delete', type: 'button',
        toolTip: 'Delete ', itemName: 'name', hidden: !this.isAdministrator
      },
      {
        key: 'edit', label: 'Edit', type: 'button',
        toolTip: 'Edit ', itemName: 'name', hidden: !this.isLoggedIn
      },
      { key: 'name', label: 'Name', description: 'Name of the city/town in Unicode.' },
      { key: 'lat', label: 'Latitude', description: 'The latitude of the city/town.' },
      { key: 'lon', label: 'Longitude', description: 'The longitude of the city/town.' },
      {
        key: 'population', label: 'Population', pipeToNumber: true,
        description: 'Estimate of the city\'s urban population.  If unavailable, the municiple population.'
      },
      { key: 'countryId', label: 'Country ID', description: 'Database ID if the country.', hidden: true },
      {
        key: 'countryName', label: 'Country', description: 'The name of the city/town\'s country.',
        type: 'link', toolTip: 'View details and map of ', itemName: 'countryName',
        authorized: true
      },
    ];
  }

  getDefaultColumn(): string {
    return 'name';
  }
  
  getNameOfItem(id: number): string {
    return this.viewSource.data.find((item: { id: number }) => item.id == id)?.name ?? '';
  }

  onDetailClick(detail: DetailEvent) {
    console.log(`CitiesComponent:  onDetailClick(${detail.key}, ${detail.row.id})`);
    switch (detail.key) {
      case 'delete':
        this.deleteItem(detail.row.id);
        break;
      case 'edit':
        this.router.navigate(['edit', detail.row.id], { relativeTo: this.activatedRoute });
        break;
      case 'countryName':
        this.router.navigate(['countries', detail.row.countryId], {
          queryParams: { returnUrl: this.router.routerState.snapshot.url }
        });
        break;
      default:
        console.error(`Invalid button click event: ${detail.key} ${detail.row.id}.`);
        break;
    }
  }

  onRowClick(row: City) {
    this.router.navigate([row.id], {
      queryParams: { returnUrl: this.router.routerState.snapshot.url },
      relativeTo: this.activatedRoute
    });
  }

  getRowToolTip(row: City) {
    return `View details and map of ${row.name}`;
  }
}
