import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGaurd } from '@app/_helpers/auth.guard';

import { AdminRegionsComponent } from './admin-regions/admin-regions.component';
import { AdminRegionComponent } from './admin-region/admin-region.component';
import { AdminRegionEditComponent } from './admin-region-edit/admin-region-edit.component';

const routes: Routes = [
  { path: '', data: { title: 'List Admin Regions', saveComponent: true }, component: AdminRegionsComponent, pathMatch: 'full' },
  { path: 'edit/:id', data: { title: 'Edit Admin Region' }, component: AdminRegionEditComponent, canActivate: [AuthGaurd] },
  { path: 'edit', data: { title: 'Add Admin Region' }, component: AdminRegionEditComponent, canActivate: [AuthGaurd] },
  { path: ':id', data: { title: 'Display Admin Region' }, component: AdminRegionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRegionsRoutingModule { }
