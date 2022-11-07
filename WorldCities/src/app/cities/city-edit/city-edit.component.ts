import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { BaseFormComponent } from '@app/_helpers/base-form.component';
import { City, Country } from '@app/_models';
import { CityService } from '@app/_services';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.scss']
})
export class CityEditComponent
  extends BaseFormComponent implements OnInit, OnDestroy {

  // the view title
  title?: string;

  // the city object to edit
  city?: City;

  // the city object id, as fetched from the active route:
  // It's NULL when we're adding a new city,
  // and not NULL when we're editing an existing one.
  id?: number;

  // the countries observable for the select (using async pipe).
  // (Another technique to prevent memory leaks)
  countries?: Observable<Country[]>;

  // Activity log (for debugging purposes)
  activityLog: string = '';

  // one method of unsubscribing to prevent memory leaks...
  private destroySubject = new Subject();

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cityService: CityService) {

    super();  // call the base class constructor
    console.log('CityEditComponent instace created.');
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      lat: ['', [
        Validators.required,
        Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/),
        Validators.min(-90),
        Validators.max(90)
      ]],
      lon: ['', [
        Validators.required,
        Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/),
        Validators.min(-180),
        Validators.max(180)
      ]],
      population: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(10000000001)
      ]],
      countryId: ['', Validators.required]
    });

    this.form.addAsyncValidators(this.isDupeCity());

    // react to form changes - For testing purposes...
    this.form.valueChanges
      .pipe(takeUntil(this.destroySubject))
      .subscribe(() => {
        if (!this.form.dirty) {
          this.log("Form Model has been loaded.");
        }
        else {
          this.log("form was updated by the user.");
        }
      });

    // testing purposes....
    this.form.get("name")!.valueChanges
      .pipe(takeUntil(this.destroySubject))
      .subscribe(() => {
        if (!this.form.dirty) {
          this.log("Name has been loaded with initial values.");
        }
        else {
          this.log("Name was updated by the user.");
        }
      });

    this.loadData();
  }

  log(str: string) {
    console.log("[" + new Date().toLocaleString() + "] " + str);
  }

  loadData() {

    // load countries
    this.loadCountries();

    // retrieve the ID from the 'id' parameter
    var idParam = this.activatedRoute.snapshot.paramMap.get('id');
    this.id = idParam ? +idParam : 0;
    console.log(`CityEditComponent idParam=${idParam}`);
    if (this.id) {
      // EDIT MODE

      // fetch the city from the server
      this.cityService.get(this.id).subscribe(result => {
        this.city = result;
        this.title = "Edit - " + this.city.name;

        // update the form with the city value
        this.form.patchValue(this.city);
      }, error => console.error(error));
    }
    else {
      // ADD NEW MODE

      this.title = "Create a new City";
    }
  }

  loadCountries() {
    // fetch all the countries from the server
    this.countries = this.cityService
      .getCountries(
        0,
        9999,
        "name",
        "asc",
        null,
        null,
      ).pipe(map(x => x.data));
  }

  onSubmit() {
    var city = (this.id) ? this.city : <City>{};
    if (city) {
      city.name = this.form.controls['name'].value;
      city.lat = this.form.controls['lat'].value;
      city.lon = this.form.controls['lon'].value;
      city.population = this.form.controls['population'].value;
      city.countryId = this.form.controls['countryId'].value;

      if (this.id) {
        // EDIT mode
        this.cityService
          .put(city)
          .subscribe(result => {

            console.log("City" + city!.id + ", " + city?.name + " has been updated.");

            // go back to cities view
            this.router.navigate(['/cities']);
          }, error => console.error(error));
      }
      else {
        // ADD NEW mode
        this.cityService
          .post(city)
          .subscribe(result => {

            console.log("City " + result.id + ", " + city?.name + " has been created.");

            // go back to cities view
            this.router.navigate(['/cities']);
          }, error => console.error(error));
      }
    }
  }

  isDupeCity(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      console.log("isDupeCity()");
      var city = <City>{};
      city.id = (this.id) ? this.id : 0;
      city.name = this.form.controls['name'].value;
      city.lat = +this.form.controls['lat'].value;
      city.lon = +this.form.controls['lon'].value;
      city.countryId = +this.form.controls['countryId'].value;

      return this.cityService.isDupeCity(city)
        .pipe(map(result => {
          return (result ? { isDupeCity: true } : null);
      }));
    }
  }

  ngOnDestroy() {
    // emit a value with the takeUntill notifyer
    this.destroySubject.next(true);
    // complete the subject
    this.destroySubject.complete();
  }
}
