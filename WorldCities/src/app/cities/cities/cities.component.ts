import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { City } from '@app/_models';
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
  }

  defineSchema(): any[] {
    console.log(`CitiesComponent:  Setting schema. isLoggedIn:  ${this.isLoggedIn}, isAdministrator:  ${this.isAdministrator}`);
    return [
      { key: 'id', label: 'ID', description: 'The database ID of the city/town.' },
      {
        key: 'delete', label: 'Delete', type: 'button', param: 'id',
        toolTip: 'Delete ', itemName: 'name', authorized: this.isAdministrator
      },
      {
        key: 'edit', label: 'Edit', type: 'button', param: 'id',
        toolTip: 'Edit ', itemName: 'name', authorized: this.isLoggedIn
      },
      { key: 'name', label: 'Name', description: 'The name of the city/town in Unicode.' },
      { key: 'lat', label: 'Latitude', description: 'The latitude of the city/town.' },
      { key: 'lon', label: 'Longitude', description: 'The longitude of the city/town.' },
      {
        key: 'population', label: 'Population', pipeToNumber: true,
        description: 'Estimate of the city\'s urban population.  If unavailable, the municiple population.'
      },
      {
        key: 'countryName', label: 'Country', type: 'link', link: '/countries/', linkId: 'countryId',
        description: 'The name of the city/town\'s country.',
        toolTip: 'View details and map of ', itemName: 'countryName',
        authorized: true
      },
    ];
  }

  defineDefaultColumn(): string {
    return 'name';
  }
  
  nameOfItem(id: number): string {
    return this.viewSource.data.find((item: { id: number; }) => item.id == id)?.name ?? '';
  }
  onMouseDown(event: any) {
    console.log("on mouse down.");
  }
  onItemButClick(event: any) {
    console.log(`CitiesComponent:  onItemButClick(${event.key}, ${event.id})`);
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
