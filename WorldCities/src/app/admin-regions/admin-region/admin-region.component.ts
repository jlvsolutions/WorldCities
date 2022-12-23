import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AdminRegion } from '@app/_models';
import { WCMapComponent } from '@app/_shared';
import { AdminRegionService } from '@app/_services';

@Component({
  selector: 'app-admin-region',
  templateUrl: './admin-region.component.html',
  styleUrls: ['./admin-region.component.scss']
})
export class AdminRegionComponent implements OnInit {

  // the view title
  title?: string;

  // the admin region object
  adminRegion?: AdminRegion;

  // the admin region object id, as fetched from the active route.
  id?: number;

  @ViewChild(WCMapComponent) wcMap!: WCMapComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private adminService: AdminRegionService) {
  }


  ngOnInit(): void {
    this.id = +(this.activatedRoute.snapshot.paramMap.get('id') ?? 0);

    if (this.id === 0 || Number.isNaN(this.id)) {
      console.error('AdminRegionComponent:  AdminRegion Id is not a valid number.');
      this.router.navigate(['/adminregions']);
    }
    this.loadData(this.id);
  }

  private loadData(id: number) {
    console.log(`AdminRegionComponent:  Retrieving AdminRegion id = ${id}`);
    // get the city from server
    this.adminService.get(id).subscribe(admin => {
      this.adminRegion = admin;
      this.title = admin.name + ', ' + admin.countryName;
      this.wcMap.showPlace(this.title);
    }, error => console.error(error));
  }
}
