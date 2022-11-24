import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AngularMaterialModule, GraphQLModule } from '@app/_shared';
import {
  ShowMessageComponent, WCMapComponent, ItemsTableComponent,
  UserFormComponent, PasswordFormComponent, QueryFilterComponent,
  SpaceAfterCommaPipe, JoinPipe
} from '@app/_shared';
import { GenericTableComponent } from './GenericTable/generic-table/generic-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations: [
    ShowMessageComponent,
    WCMapComponent,
    UserFormComponent,
    PasswordFormComponent,
    QueryFilterComponent,
    ItemsTableComponent,
    SpaceAfterCommaPipe,
    JoinPipe,
    GenericTableComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AngularMaterialModule,
    GraphQLModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
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
    JoinPipe
  ]
})
export class SharedModule { }
