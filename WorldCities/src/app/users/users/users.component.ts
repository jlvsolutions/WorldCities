import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { User, ItemSchema, DetailEvent } from '@app/_models';
import { UserService, AuthService } from '@app/_services';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    standalone: false
})
export class UsersComponent extends BaseItemsComponent<User, string> {

  constructor(
    cd: ChangeDetectorRef,
    router: Router,
    activatedRoute: ActivatedRoute,
    authService: AuthService,
    userService: UserService) {
    super(cd, router, activatedRoute, authService, userService);
    console.log('UsersComponent instance created.');

    this.title = 'Users';
  }

  getItemSchema(): ItemSchema[] {
    console.log(`CitiesComponent:  Setting schema. isLoggedIn:  ${this.isLoggedIn}, isAdministrator:  ${this.isAdministrator}`);
    return [
      { key: 'id', label: 'ID', description: 'The database ID of the user.', hidden: true },
      {
        key: 'delete', label: 'Delete', type: 'button',
        toolTip: 'Delete ', itemName: 'name', hidden: !this.isAdministrator
      },
      {
        key: 'edit', label: 'Edit', type: 'button',
        toolTip: 'Edit ', itemName: 'name', hidden: !this.isAdministrator
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

  getDefaultColumn(): string {
    return 'email';
  }

  getNameOfItem(id: string): string {
    return this.viewSource.data.find((item: { id: string; }) => item.id == id)?.name ?? '';
  }

  onDetailClick(detail: DetailEvent) {
    console.log(`UsersComponent:  onDetailClick(${detail.key}, ${detail.row.id})`);
    switch (detail.key) {
      case 'delete':
        this.deleteItem(detail.row.id);
        break;
      case 'edit':
        this.router.navigate(['edit', detail.row.id], { relativeTo: this.activatedRoute });
        break;
      default:
        console.error(`Invalid button click event: ${detail.key} ${detail.row.id}.`);
        break;
    }
  }

  onRowClick(row: User) {
    this.router.navigate([row.id], {
      queryParams: { returnUrl: this.router.routerState.snapshot.url },
      relativeTo: this.activatedRoute
    });
  }

  getRowToolTip(row: User) {
    return `View additional user details for ${row.name}`;
  }

  onParamsChanged(params: Params): void { }
}
