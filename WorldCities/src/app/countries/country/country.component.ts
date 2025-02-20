import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Country } from '@app/_models';
import { WCMapComponent } from '@app/_shared';
import { CountryService } from '@app/_services';

@Component({
    selector: 'app-country',
    templateUrl: './country.component.html',
    styleUrls: ['./country.component.scss'],
    standalone: false
})
export class CountryComponent implements OnInit {

  // the view title
  title?: string;

  // the country object
  country?: Country;

  // the country object id, as fetched from the active route.
  id?: number;

  @ViewChild(WCMapComponent) wcMap!: WCMapComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private countryService: CountryService) {
  }

  ngOnInit(): void {
    this.id = +(this.activatedRoute.snapshot.paramMap.get('id') ?? '0');

    if (this.id === 0 || Number.isNaN(this.id)) {
      console.error('CountryComponent:  Country Id is not a valid number.');
      this.router.navigate(['/countries']);
    }
    this.loadData(this.id);
  }

  private loadData(id: number) {
    console.log(`CountryComponent:  Retrieving country id = ${id}`);

    this.countryService.get(id).subscribe(country => {
      this.country = country;
      this.title = country.name;
      this.wcMap.showPlace(country.name);
    }, error => console.error(error));
  }
}
