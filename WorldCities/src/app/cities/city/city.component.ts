import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { City } from '@app/_models';
import { WCMapComponent } from '@app/_shared';
import { CityService } from '@app/_services';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit {

  // the view title
  title?: string;

  // the city object
  city?: City;

  // the city object id, as fetched from the active route.
  id?: number;

  @ViewChild(WCMapComponent) wcMap!: WCMapComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cityService: CityService) {
  }

  ngOnInit(): void {
    this.id  = +(this.activatedRoute.snapshot.paramMap.get('id') ?? '0');

    if (this.id === 0 || Number.isNaN(this.id)) {
      console.error('CityComponent:  City Id is not a valid number.');
      this.router.navigate(['/cities']);
    }
    this.loadData(this.id);
  }

  private loadData(id: number) {
    console.log(`CityComponent:  Retrieving city id = ${id}`);

    // get the city from server
    this.cityService.get(id).subscribe(city => {
      this.city = city;
      this.title = city.name + ', ' + (city.adminRegionName ?? city.countryName);
      this.wcMap.showPlace(this.title);
    }, error => console.error(error));
  }
}
