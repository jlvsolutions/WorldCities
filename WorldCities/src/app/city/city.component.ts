import { AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, DoCheck, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { City } from '@app/_models';
import { WCMapComponent } from '@app/wcmap/wcmap.component';
import { CityService } from '@app/_services';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit, OnChanges, DoCheck,
  AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy {

  // the view title
  title?: string;

  // the city object to edit
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
    var idParam = this.activatedRoute.snapshot.paramMap.get('id') ?? '0';
    this.id = +idParam;
    console.log('CityComponent: OnInit() id=' + this.id);
    this.loadData(this.id);
  }

  loadData(id: number) {
    if (id === 0)
      return;
    console.log('loadData retrieving city id = ', id);

    // get the city from server
    this.cityService.get(id).subscribe(city => {
      this.city = city;  // this will be used to fill out the template.
      this.title = city.name;
      this.wcMap.place = city.name;
      console.log('CityComponent loadData received data for id = ' + id + ' ' + city.name);
      console.log('Calling wcMap.showPlace');
      this.wcMap.showPlace(city.name);
    }, error => console.error(error));
  }

  ngOnChanges() { console.log('CityComponent: OnChanges()'); }
  ngDoCheck() { console.log('CityComponent: DoCheck()'); }
  ngAfterContentInit() { console.log('CityComponent: AfterContentInit()'); }
  ngAfterContentChecked() { console.log('CityComponent: AfterContentChecked()'); }
  ngAfterViewInit() { console.log('CityComponent: AfterViewInit()'); }
  ngAfterViewChecked() { console.log('CityComponent: AfterViewChecked()'); }
  ngOnDestroy() { console.log('CityComponent: OnDestroy()'); }
}
