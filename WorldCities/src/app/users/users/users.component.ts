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
    router: Router,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    userService: UserService) {
    super(router, activatedRoute, authService, userService);
    console.log('UsersComponent instance created.');

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
        key: 'emailConfirmed', label: 'Email Confirmed', type: 'boolean',
        description: 'Indicates whether the email address for the user has been confirmed.'
      },
      {
        key: 'lockoutEnabled', label: 'Lockout Enabled', type: 'boolean',
        description: 'Indicates whether lockout has been enabled.'
      },
      { key: 'roles', label: 'Roles', description: 'The roles the user belongs to.', join: ', ', noSort: true }
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
