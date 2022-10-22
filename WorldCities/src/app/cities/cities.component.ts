import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinct, distinctUntilChanged } from 'rxjs/operators';

import { City } from '@app/_models';
import { CityService } from '../_services/city.service';
import { AuthService } from '../_services/auth.service';
import { AuthGaurd } from '../_helpers/auth.guard';

@Component({
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss']
})
export class CitiesComponent implements OnInit, OnDestroy {
  public displayedColumns: string[] = ['id', 'name', 'lat', 'lon', 'population', 'countryName'];
  public cities!: MatTableDataSource<City>;
  isLoggedIn: boolean = false;
  private destroySubject = new Subject();

  defaultPageIndex: number = 0;
  defaultPageSize: number = 15;
  public defaultSortColumn: string = "name";
  public defaultSortOrder: "asc" | "desc" = "asc";

  defaultFilterColumn: string = "name";
  filterQuery?: string | null = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cityService: CityService,
    private authService: AuthService) {

    this.authService.user
      .pipe(takeUntil(this.destroySubject))
      .subscribe(user => {
        console.log(`CitiesComponent:  user = ${user?.user?.name}, ${user?.user?.email}`);
        this.isLoggedIn = authService.isAuthenticated();
      })
  }

  ngOnInit() {
    console.log("CitiesComponent: OnInit()");
    this.filterQuery = '';
    this.isLoggedIn = this.authService.isAuthenticated();
    this.clearSearch();
    this.loadData();
  }

  // Debounce filter text changes
  onFilterTextChanged(filterText: string) {
    if (this.filterTextChanged.observers.length === 0) {
      this.filterTextChanged
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe(query => {
          this.loadData(query);
        })
    }
    this.filterTextChanged.next(filterText);
  }

  loadData(query?: string) {
    let pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;
    this.filterQuery = query;
    this.getData(pageEvent);
  }

  getData(event: PageEvent) {

    var sortColumn = (this.sort) ? this.sort.active : this.defaultSortColumn;
    var sortOrder = (this.sort) ? this.sort.direction : this.defaultSortOrder;
    var filterColumn = (this.filterQuery) ? this.defaultFilterColumn : null;
    var filterQuery = (this.filterQuery) ? this.filterQuery : null;

    this.cityService.getData(
      event.pageIndex,
      event.pageSize,
      sortColumn,
      sortOrder,
      filterColumn,
      filterQuery)
        .subscribe(result => {
          this.paginator.length = result.totalCount;
          this.paginator.pageIndex = result.pageIndex;
          this.paginator.pageSize = result.pageSize;
          this.cities = new MatTableDataSource<City>(result.data);
        }, error => console.error(error));
  }

  clearSearch() {
    console.log(`clear search value ${this.filterQuery}`);
    this.filterQuery = '';
    this.loadData();
  }

  ngOnDestroy() {
    console.log("CitiesComponent: OnDestroy()");
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }
}
