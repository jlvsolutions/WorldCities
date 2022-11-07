import { NgModule } from '@angular/core';

import { SharedModule } from '@app/_shared/shared.module';

import { UsersComponent } from './users/users.component';
import { UserEditComponent } from './user-edit/user-edit.component';
import { UsersRoutingModule } from './users-routing.module';
import { UserService } from '@app/_services';

import { RouteReuseStrategy } from '@angular/router';
import { WCReuseStrategy } from '@app/_helpers/wc-reuse-strategy';


@NgModule({
  declarations: [
    UsersComponent,
    UserEditComponent
  ],
  imports: [
    SharedModule,
    UsersRoutingModule
  ],
  exports: [
    UsersComponent,
    UserEditComponent
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: WCReuseStrategy },
    UserService
  ]
})
export class UsersModule { }
