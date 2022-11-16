import { Component } from '@angular/core';
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
    private router: Router,
    private activatedRoute: ActivatedRoute,
    authService: AuthService,
    cityService: CityService) {
    super(authService, cityService);

    this.setSchema();
    this.defaultSortColumn = 'name';
    this.defaultFilterColumn = 'name';
    this.sort = { direction: this.defaultSortOrder, active: 'name' };
  }

  override setSchema(): void {
    console.log('CitiesComponent setting schema.');
    this.viewSource.schema = [
      { key: 'id', label: 'ID' },
      {
        key: 'delete', label: 'Delete', type: 'button', param: 'id',
        toolTip: 'Delete ', itemName: 'name', authorized: this.isAdministrator
      },
      {
        key: 'edit', label: 'Edit', type: 'button', param: 'id',
        toolTip: 'Edit ', itemName: 'name', authorized: this.isLoggedIn
      },
      { key: 'name', label: 'Name' },
      { key: 'lat', label: 'Latitude' },
      { key: 'lon', label: 'Longitude' },
      { key: 'population', label: 'Population', pipeToNumber: true },
      {
        key: 'countryName', label: 'Country', type: 'link', link: '/countries/', linkId: 'countryId',
        toolTip: 'View details and map of ', itemName: 'countryName',
        authorized: true
      },
    ].filter(s => !(s.type === 'button' && !s.authorized));
  }

  onItemButClick(event: any) {
    console.log(`CitiesComponent:  onItemButClick(${event.key}, ${event.id})`);
    switch (event.key) {
      case 'delete':
        this.onDeleteClicked(+event.id);
        break;
      case 'edit':
        this.router.navigate(['edit', event.id], { relativeTo: this.activatedRoute });
        break;
      default:
        console.error('Invalid ')

    }
  }


  override nameOfItem(id: any): string {
    return this.viewSource.data.find(item => item.id == id)?.name!;
  }
}
