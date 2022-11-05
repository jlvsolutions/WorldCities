import { Component, OnInit, Input, OnChanges, DoCheck, AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';

import { wcMapConfig } from './wcmap.config';

@Component({
  selector: 'app-wcmap',
  templateUrl: './wcmap.component.html',
  styleUrls: ['./wcmap.component.scss']
})
export class WCMapComponent implements OnInit {

  private readonly basePlaceURL: string = "https://www.google.com/maps/embed/v1/place?key=" + wcMapConfig.apiKey + "&q=";

  safeMapURL: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
  form!: FormGroup;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      place: new FormControl('', [Validators.required, Validators.maxLength(40)])
    });
  }

  onSubmit() {
    if (!this.form.valid)
      return;
    var place = this.form.controls['place'].value;
    console.log(`onSubmit()  Showing a place: ${place}`);
    place = place.replace(/ /g, "+");
    console.log(`onSubmit()  Place value prepped: ${place}`);
    this.safeMapURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.basePlaceURL + place);
  }

  showPlace(place: string) {
    if (!place) {
      console.log('showPlace()  place parameter is null or undefined.');
      return;
    }
    this.form.controls["place"].setValue(place);
    place = place.replace(/ /g, "+");
    console.log(`showPlace(${place}) Place value prepped: ${place}`);
    this.safeMapURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.basePlaceURL + place);
  }
}
