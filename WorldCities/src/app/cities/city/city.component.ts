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
export class CityComponent implements OnInit, OnDestroy {

  // the view title
  title?: string;

  // the city object to edit
  city?: City;

  // the city object id, as fetched from the active route.
  id?: number;
  /** Id parameter provided by the route */
  public routeParamId = 0;

  @ViewChild(WCMapComponent) wcMap!: WCMapComponent;

  private loggingEnabled: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cityService: CityService) {
  }

  ngOnInit(): void {
    var idParam = this.activatedRoute.snapshot.paramMap.get('id') ?? '0';

    //this.activatedRoute.queryParams.subscribe(params => { idParam = params['id']; }); // shared by all routes

    this.activatedRoute.params.subscribe(p => this.routeParamId = +p['id']);

    this.id = +idParam;
    console.log(`CityComponent:  OnInit() routeParamId = ${this.routeParamId}`);
    if (this.id === 0 || Number.isNaN(this.id)) {
      console.error('CityComponent:  City Id is not a valid number.');
      this.router.navigate(['/cities']);
    }
    this.loadData(this.id);
  }

  loadData(id: number) {
    if (id === 0 || Number.isNaN(id))
      return;
    this.log(`loadData retrieving city id = ${id}`);

    // get the city from server
    this.cityService.get(id).subscribe(city => {
      this.city = city;
      this.title = city.name + ', ' + (city.adminRegionName ?? city.countryName);
      this.wcMap.showPlace(city.name + "," + (city.adminRegionName ?? city.countryName));
    }, error => console.error(error));
  }
  ngOnDestroy() {
    this.log(`CityComponent: OnDestroy() Id = ${this.id} routeParam = ${this.routeParamId}`);
  }

  private log(msg: string): void {
    if (this.loggingEnabled)
      console.log(`CityComponent:  ${msg}`);
  }
}
