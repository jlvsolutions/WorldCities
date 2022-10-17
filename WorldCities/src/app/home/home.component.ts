import { Component, OnInit, ViewChild } from '@angular/core';
import { WCMapComponent } from '@app/wcmap/wcmap.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild(WCMapComponent) wcMap!: WCMapComponent;

  constructor() { }

  ngOnInit(): void {
  }

}
