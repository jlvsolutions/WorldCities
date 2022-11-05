import { NgModule } from '@angular/core';

import { SharedModule } from '@app/_shared/shared.module';

import { UsersComponent } from './users/users.component';
import { UserEditComponent } from './user-edit/user-edit.component';



@NgModule({
  declarations: [
    UsersComponent,
    UserEditComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    UsersComponent,
    UserEditComponent
  ]
})
export class UsersModule { }
