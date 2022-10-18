import { Component, OnInit, Input, OnChanges, DoCheck, AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';

import { wcMapConfig } from './wcmap.config';

@Component({
  selector: 'app-wcmap',
  templateUrl: './wcmap.component.html',
  styleUrls: ['./wcmap.component.scss']
})
export class WCMapComponent implements OnInit, OnChanges, DoCheck,  AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy {

  private readonly basePlaceURL: string = "https://www.google.com/maps/embed/v1/place?key=" + wcMapConfig.apiKey + "&q=";

  safeMapURL: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
  form!: FormGroup;
  @Input() place: any;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    console.log('WCMapComponent: OnInit() place=' + this.place);
    this.form = new FormGroup({
      place: new FormControl('', [Validators.required, Validators.maxLength(40)])
    });
    if (this.place)
      this.safeMapURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.basePlaceURL + this.place);
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

  showPlace(place: string) {
    console.log('showPlace showing ' + place);
    place = place.replace(/ /g, "+");
    console.log(`Place value prepped: ${place}`);
    this.safeMapURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.basePlaceURL + place);
  }

  ngOnChanges() { console.log('WCMapComponent: OnChanges() place=' + this.place); }
  ngDoCheck() { console.log('WCMapComponent: DoCheck() place=' + this.place); }
  ngAfterContentInit() { console.log('WCMapComponent: AfterContentInit() place=' + this.place); }
  ngAfterContentChecked() { console.log('WCMapComponent: AfterContentChecked() place=' + this.place); }
  ngAfterViewInit() { console.log('WCMapComponent: AfterViewInit() place=' + this.place); }
  ngAfterViewChecked() { console.log('WCMapComponent: AfterViewChecked() place=' + this.place); }
  ngOnDestroy() { console.log('WCMapComponent: OnDestroy() place=' + this.place); }

}
