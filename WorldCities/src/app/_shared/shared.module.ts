import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AngularMaterialModule, GraphQLModule } from '@app/_shared';
import {
  ShowMessageComponent, WCMapComponent, ItemsTableComponent,
  UserFormComponent, PasswordFormComponent, FilterQueryComponent,
  SpaceAfterCommaPipe, JoinPipe
} from '@app/_shared';

@NgModule({
  declarations: [
    ShowMessageComponent,
    WCMapComponent,
    UserFormComponent,
    PasswordFormComponent,
    FilterQueryComponent,
    ItemsTableComponent,
    SpaceAfterCommaPipe,
    JoinPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AngularMaterialModule,
    GraphQLModule
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
    FilterQueryComponent,
    ItemsTableComponent,
    SpaceAfterCommaPipe,
    JoinPipe
  ]
})
export class SharedModule { }
