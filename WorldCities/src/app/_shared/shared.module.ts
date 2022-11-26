import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

//import { AngularMaterialModule, GraphQLModule } from '@app/_shared';
import { AngularMaterialModule } from '@app/_shared/angular-material.module';

// Components must be imported using their own direct path.  Using the index.ts is fine
// for building and running but **NOT** for testing with Jasmine and Karma.
import { GenericTableComponent } from './GenericTable/generic-table/generic-table.component';
import { ShowMessageComponent } from '@app/_shared/show-message/show-message.component';
import { WCMapComponent } from '@app/_shared/wcmap/wcmap.component';
import { UserFormComponent } from '@app/_shared/user-form/user-form.component';
import { PasswordFormComponent } from '@app/_shared/password-form/password-form.component';
import { QueryFilterComponent } from '@app/_shared/query-filter/query-filter.component';
import { ItemsTableComponent } from '@app/_shared/items-table/items-table.component';
import { SpaceAfterCommaPipe } from '@app/_shared/pipes/space-after-comma.pipe';
import { JoinPipe } from '@app/_shared/pipes/join.pipe';

@NgModule({
  declarations: [
    GenericTableComponent,
    ShowMessageComponent,
    WCMapComponent,
    UserFormComponent,
    PasswordFormComponent,
    QueryFilterComponent,
    ItemsTableComponent,
    SpaceAfterCommaPipe,
    JoinPipe,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AngularMaterialModule,
//    GraphQLModule,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AngularMaterialModule,
    ShowMessageComponent,
    WCMapComponent,
    UserFormComponent,
    PasswordFormComponent,
    QueryFilterComponent,
    ItemsTableComponent,
    SpaceAfterCommaPipe,
    JoinPipe,
    GenericTableComponent,
  ]
})
export class SharedModule { }
