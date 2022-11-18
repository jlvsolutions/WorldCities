import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { User } from '@app/_models';
import { UserService, AuthService } from '@app/_services';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent extends BaseItemsComponent<User, string> {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    authService: AuthService,
    userService: UserService) {
    super(authService, userService);

    this.defaultSortColumn = 'name';
    this.defaultFilterColumn = 'email';
    this.sort = { direction: this.defaultSortOrder, active: 'email' };
  }

  defineSchema(): any[] {
    console.log(`CitiesComponent:  Setting schema. isLoggedIn:  ${this.isLoggedIn}, isAdministrator:  ${this.isAdministrator}`);
    return [
      { key: 'id', label: 'ID', description: 'The database ID of the user.', hidden: true },
      {
        key: 'delete', label: 'Delete', type: 'button', param: 'id',
        toolTip: 'Delete ', itemName: 'name', authorized: this.isAdministrator
      },
      {
        key: 'edit', label: 'Edit', type: 'button', param: 'id',
        toolTip: 'Edit ', itemName: 'name', authorized: this.isAdministrator
      },
      { key: 'email', label: 'Email', description: 'The unique login email of the user.' },
      { key: 'name', label: 'Name', description: 'The friendly display name of the user.' },
      {
        key: 'emailConfirmed', label: 'Email Confirmed', type: 'boolean', authorized: this.isAdministrator,
        description: 'Indicates whether the email address for the user has been confirmed.'
      },
      {
        key: 'lockoutEnabled', label: 'Lockout Enabled', type: 'boolean', authorized: false,  // false for testing...
        description: 'Indicates whether lockout has been enabled.'
      },
      { key: 'roles', label: 'Roles', description: 'The roles the user belongs to.', spaceAfterComma: true }
     ];
  }

  nameOfItem(id: string): string {
    return this.viewSource.data.find((item: { id: string; }) => item.id == id)?.name ?? '';
  }

  onItemButClick(event: any) {
    console.log(`CitiesComponent:  onItemButClick(${event.key}, ${event.id})`);
    switch (event.key) {
      case 'delete':
        this.deleteItem(event.id);
        break;
      case 'edit':
        this.router.navigate(['edit', event.id], { relativeTo: this.activatedRoute });
        break;
      default:
        console.error(`Invalid button click event: ${event.key} ${event.id}.`);
    }
  }
}
