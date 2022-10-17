import { Component, OnInit } from '@angular/core';
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
    console.log(`Showing a place: ${place}`);
    place = place.replace(/ /g, "+");
    console.log(`Place value prepped: ${place}`);
    this.safeMapURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.basePlaceURL + place);
  }
  /*
  onSubmit(place: string): void {

    if (place.length > 30) {
      // Just a little extra protection.
      console.log(`onSubmit:  place is too long: ${place}`);
      return;
    }

    console.log(`onSubmit clicked. this.place = ${place}`);
    place = place.replace(/ /g, "+");
    console.log(`onSubmit clicked. this.place prepped = ${place}`);
    this.safeMapURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.basePlaceURL + place);

  }
  */
}
