import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { AdminRegion, DetailEvent, ItemSchema } from '@app/_models';
import { AdminRegionService, AuthService } from '@app/_services';

@Component({
  selector: 'app-admin-regions',
  templateUrl: './admin-regions.component.html',
  styleUrls: ['./admin-regions.component.scss']
})
export class AdminRegionsComponent extends BaseItemsComponent<AdminRegion, number> {

  constructor(
    cd: ChangeDetectorRef,
    router: Router,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    adminRegionService: AdminRegionService) {
    super(cd, router, activatedRoute, authService, adminRegionService);
    console.log('AdminRegionsComponent instance created.');

    this.title = 'Administration Regions';

  }

  getItemSchema(): ItemSchema[] {
    console.log(`AdminRegionsComponent:  Setting schema. isLoggedIn:  ${this.isLoggedIn}, isAdministrator:  ${this.isAdministrator}`);
    return [
      { key: 'id', label: 'ID', description: 'The database ID of the administration region.' },
      {
        key: 'delete', label: 'Delete', type: 'button',
        toolTip: 'Delete ', itemName: 'name', hidden: !this.isAdministrator
      },
      {
        key: 'edit', label: 'Edit', type: 'button',
        toolTip: 'Edit ', itemName: 'name', hidden: !this.isLoggedIn
      },
      { key: 'name', label: 'Name', description: 'The name of the administration region.' },
      { key: 'code', label: 'Code', description: 'The code of the administration region.' },
      {
        key: 'totCities', label: 'Total Cities', description: 'The total number of cities in the administration region.',
        type: 'link', toolTip: 'View list of cities in ', itemName: 'name',
        authorized: true
      },
      { key: 'capitalId', label: 'Capital ID', description: 'The database ID for the capital city/town of the administration region.' },
      { key: 'capitalName', label: 'Capital Name', description: 'The name of the capital city/town' },
      { key: 'countryId', label: 'Country ID', description: 'Database ID of the country.', hidden: true },
      {
        key: 'countryName', label: 'Country', description: 'The name of the administration region\'s country.',
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

  getRowToolTip(row: AdminRegion) {
    return `View details and map of ${row.name}`;
  }

  onRowClick(row: AdminRegion) {
    console.log(`AdminRegionsComponent onRowClick: AdminRegion Name=${row.name}`);
    this.router.navigate([row.id], {
      queryParams: { returnUrl: this.router.routerState.snapshot.url },
      relativeTo: this.activatedRoute
    });
  }

  onDetailClick(detail: DetailEvent) {
    console.log(`AdminRegionsComponent:  onDetailClick(${detail.key}, ${detail.row.id})`);
    switch (detail.key) {
      case 'delete':
        this.deleteItem(detail.row.id);
        break;
      case 'edit':
        this.router.navigate(['edit', detail.row.id], { relativeTo: this.activatedRoute });
        break;
      case 'totCities':
        this.router.navigate(['cities'], {
          queryParams: { AdminRegion: detail.row.id, sortColumn: 'name' }
        });
        break;
      default:
        console.error(`Invalid button click event: ${detail.key} ${detail.row.id}.`);
        break;
    }
  }

  onParamsChanged(params: Params): void { }
}
