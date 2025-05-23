import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { City, DetailEvent, ItemSchema } from '@app/_models';
import { CityService, AuthService } from '@app/_services';

@Component({
    selector: 'app-cities',
    templateUrl: './cities.component.html',
    styleUrls: ['./cities.component.scss'],
    standalone: false
})
export class CitiesComponent extends BaseItemsComponent<City, number> {

  constructor(
    cd: ChangeDetectorRef,
    router: Router,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    cityService: CityService) {
    super(cd, router, activatedRoute, authService, cityService);
    console.log('CitiesComponent instance created.');

    this.title = 'Cities';
  }

  getItemSchema(): ItemSchema[] {
    console.log(`CitiesComponent:  getItemSchema. isLoggedIn:  ${this.isLoggedIn}, isAdministrator:  ${this.isAdministrator}`);
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
      { key: 'capital', label: 'Capital', description: 'Primary if national capital\nAdmin if regional capital.' },
      { key: 'adminRegionId', label: 'Administration Region ID', description: 'Database ID of the administration region.' },
      {
        key: 'adminRegionName', label: 'Administration Region Name', description: 'Name of the administrtration region.',
        type: 'link', toolTip: 'View details and map of ', itemName: 'adminRegionName',
        authorized: true
      },
      { key: 'countryId', label: 'Country ID', description: 'Database ID of the country.', hidden: true },
      {
        key: 'countryName', label: 'Country', description: 'The name of the city/town\'s country.',
        type: 'link', toolTip: 'View details and map of ', itemName: 'countryName',
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
      case 'adminRegionName':
        this.router.navigate(['adminregions', detail.row.adminRegionId], {
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

  onParamsChanged(params: Params): void {
    this.subQuery = undefined;
    this.titleSuffix = '';
    if (params['AdminRegion']) {
      this.subQuery = { name: 'AdminRegion', id: +params['AdminRegion'] };
      console.log(`onParamsChanbed: subQuery AdminRegion=${this.subQuery.id}`);
    }
    else if (params['Country']) {
      this.subQuery = { name: 'Country', id: +params['Country'] };
      console.log(`onParamsChanged: subQuery Country=${this.subQuery.id}`);
    }
  }
}
