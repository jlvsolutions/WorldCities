import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from '../angular-material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { CitiesComponent } from './cities.component';
import { City } from './city';
import { CityService } from '@app/_services/city.service';
import { ApiResult } from '@app/_services/base.service';

describe('CitiesComponent', () => {
  let component: CitiesComponent;
  let fixture: ComponentFixture<CitiesComponent>;

  beforeEach(async () => {

    // Create a mock cityService object with a mock 'getData' method
    let cityService = jasmine.createSpyObj<CityService>('CityService', ['getData']);

    // Configure the 'getData' spy method
    cityService.getData.and.returnValue(
      // return an Observable with some test data
      of<ApiResult<City>>(<ApiResult<City>>{
        data: [
          <City>{ name: 'TestCity1', id: 1, lat: 2, lon: 3, population: 4, countryId: 5, countryName: 'TestCountry1' },
          <City>{ name: 'TestCity2', id: 2, lat: 3, lon: 4, population: 5, countryId: 6, countryName: 'TestCountry2' },
          <City>{ name: 'TestCity3', id: 3, lat: 4, lon: 5, population: 6, countryId: 7, countryName: 'TestCountry3' }
        ],
        totalCount: 3,
        pageIndex: 0,
        pageSize: 10
      }));

    await TestBed.configureTestingModule({
      declarations: [CitiesComponent],
      imports: [
        BrowserAnimationsModule,
        AngularMaterialModule,
        RouterTestingModule
      ],
      providers: [  // reference required providers...
        {
          provide: CityService,
          useValue: cityService
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CitiesComponent);
    component = fixture.componentInstance;

    // configure fixture/component/children/etc.
    component.paginator = jasmine.createSpyObj(
      "MatPaginator", ["length", "pageIndex", "pageSize"]
    );


    fixture.detectChanges();
  });

  // ***  Tests ***

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a "Cities" title', () => {
    let title = fixture.nativeElement
      .querySelector('h1');
    expect(title.textContent).toEqual('Cities');
  });

  it('should contain a table with a list of one or more cities', () => {
    let table = fixture.nativeElement
      .querySelector('table.mat-table');
    let tableRows = table
      .querySelectorAll('tr.mat-row');

    expect(tableRows.length).toBeGreaterThan(0);
    // TODO:  learn how to access rows for testing  the <td has <a child with textConent 'TestCity1'
  });

});
