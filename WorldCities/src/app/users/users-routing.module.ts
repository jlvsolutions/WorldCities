import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminAuthGaurd } from '@app/_helpers/admin-auth.guard';

import { UsersComponent } from './users/users.component';
import { UserEditComponent } from './user-edit/user-edit.component';

const routes: Routes = [
  { path: '', data: { title: 'List Users', saveComponent: true }, component: UsersComponent, pathMatch: 'full' },
  { path: 'edit/:id', data: { title: 'Edit User' }, component: UserEditComponent, canActivate: [AdminAuthGaurd] },
  { path: 'edit', data: { title: 'Add User' }, component: UserEditComponent, canActivate: [AdminAuthGaurd] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
