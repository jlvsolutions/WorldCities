import { NgModule } from '@angular/core';

import { SharedModule } from '@app/_shared/shared.module';

import { AdminRegionsComponent } from './admin-regions/admin-regions.component';
import { AdminRegionComponent } from './admin-region/admin-region.component';
import { AdminRegionEditComponent } from './admin-region-edit/admin-region-edit.component';
import { AdminRegionsRoutingModule } from './admin-regions-routing.module';
import { AdminRegionService } from '@app/_services';

@NgModule({
  declarations: [
    AdminRegionsComponent,
    AdminRegionComponent,
    AdminRegionEditComponent
  ],
  imports: [
    SharedModule,
    AdminRegionsRoutingModule
  ],
  providers: [
    AdminRegionService
  ]
})
export class AdminRegionsModule { }
