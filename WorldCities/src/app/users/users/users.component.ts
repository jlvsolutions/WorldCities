import { Component, ViewChild } from '@angular/core';

import { ShowMessageComponent } from '@app/_shared';

import { BaseItemsComponent } from '@app/_helpers/base-items.component';
import { User } from '@app/_models';
import { UserService, AuthService } from '@app/_services';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent extends BaseItemsComponent<User, string> {

  @ViewChild(ShowMessageComponent) show!: ShowMessageComponent;

  message?: string;
  errMessage?: string;

  constructor(authService: AuthService, userService: UserService) {
    super(authService, userService);
    this.displayedColumns = ['delete', 'edit', 'name', 'email', 'roles', 'emailConfirmed', 'lockoutEnabled'];
    this.defaultSortColumn = 'name';
    this.defaultFilterColumn = 'name';
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

    this.service.delete(user.id)
      .subscribe(result => {

        console.log(result.message + `, ${user.name}, ${user.email}`);
        this.show.setMessages(true, `User Deleted: ${user.name}, ${user.email}` );

        // Reload the users data.
        this.ngOnInit(); // This causes 
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
}
