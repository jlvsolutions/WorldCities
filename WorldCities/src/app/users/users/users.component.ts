import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { debounceTime, distinct, distinctUntilChanged } from 'rxjs/operators';

import { ShowMessageComponent } from '@app/_shared';
import { User } from '@app/_models';
import { UserService, AuthService } from '@app/_services';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public displayedColumns: string[] = ['delete', 'edit', 'name', 'email', 'roles', 'emailConfirmed', 'lockoutEnabled'];
  public users!: MatTableDataSource<User>;

  defaultPageIndex: number = 0;
  defaultPageSize: number = 10;
  public defaultSortColumn: string = "name";
  public defaultSortOrder: "asc" | "desc" = "asc";

  defaultFilterColumn: string = "name";
  filterQuery?: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(ShowMessageComponent) show!: ShowMessageComponent;

  filterTextChanged: Subject<string> = new Subject<string>();

  message?: string;
  errMessage?: string;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router) {
  }

  ngOnInit() {
    console.log("Listing users...");
    this.loadData();
  }

  /**
   * Invoked when the user clicks on a delete button
   * in the list of users.  Shows a delete confirmation dialog.
   * @param user The user to delete.
   */
  onDeleteClicked(user: User): void {
    console.log(`Deleting user: ${user.name}, ${user.email}...`);
    this.show.clearMessages();

    if (!confirm(`Are you sure you want to delete ${user.name}?`)) {
      console.log(`User Declined to delete ${user.name}.`);
      return;
    }
    console.log(`User Confirmed to delete ${user.name}, ${user.email}.`);

    this.userService.delete(user.id)
      .subscribe(result => {

        console.log(result.message + `, ${user.name}, ${user.email}`);
        this.show.setMessages(true, `User Deleted: ${user.name}, ${user.email}` );

        // Reload the users data.
        this.ngOnInit();
      }, error => {
        console.error(error);
        switch (error.status) {
          case 400: // Bad Request
          case 404: // Not Found
          case 405: // Method Not Allowed
            this.show.setMessages(false, error.message);
            break;
          default:
            this.show.setMessages(false, `We had a problem on our end. Please try again. Message: ${error.statusText}`);
            break;
        };
      });
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

    this.userService.getData(
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
        this.users = new MatTableDataSource<User>(result.data);
      }, error => console.error(error));
  }
}
