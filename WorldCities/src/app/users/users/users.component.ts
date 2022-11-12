import { Component, ViewChild } from '@angular/core';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { User } from '@app/_models';
import { UserService, AuthService } from '@app/_services';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent extends BaseItemsComponent<User, string> {

  constructor(authService: AuthService, userService: UserService) {
    super(authService, userService);
    this.modelColumns = ['delete', 'edit', 'name', 'email', 'roles', 'emailConfirmed', 'lockoutEnabled'];
    this.displayColumns = ['Delete', 'Edit', 'Name', 'Email', 'Roles', 'Email Confirmed', 'Lockout Enabled'];
    this.defaultSortColumn = 'name';
    this.defaultFilterColumn = 'name';
  }

}
