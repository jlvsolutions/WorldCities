import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Country } from '@app/_models';
import { CountryService, AuthService } from '@app/_services';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']
})
export class CountriesComponent implements OnInit, OnDestroy {
  public displayedColumns: string[] = ['id', 'name', 'iso2', 'iso3', 'totCities'];
  public countries!: MatTableDataSource<Country>;
  defaultPageIndex: number = 0;
  defaultPageSize: number = 15;
  public defaultSortColumn: string = "name";
  public defaultSortOrder: "asc" | "desc" = "asc";

  defaultFilterColumn: string = "name";
  filterQuery?: string;
  isLoggedIn: boolean = false;
  private destroySubject = new Subject();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterTextChanged: Subject<string> = new Subject<string>();

  constructor(
    private countryService: CountryService,
    private authService: AuthService) {

    console.log('CountriesComponent instance created.');
    this.authService.user
      .pipe(takeUntil(this.destroySubject))
      .subscribe(user => {
        if (user)
          console.log(`CountriesComponent:  user = ${user.name}, ${user.email}`);
        else
          console.log('CountriesComponent:  No user logged in.');
        this.isLoggedIn = authService.isAuthenticated();
      })
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.loadData();
  }

  ngOnDestroy() {
    console.log('CountriesComponent instance destroyed.');
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
    var pageEvent = new PageEvent();
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

    this.countryService.getData(
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
        this.countries = new MatTableDataSource<Country>(result.data);
      }, error => console.error(error));
  }
}
