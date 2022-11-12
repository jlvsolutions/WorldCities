import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AngularMaterialModule, GraphQLModule } from '@app/_shared';
import {
  ShowMessageComponent, WCMapComponent,
  UserFormComponent, PasswordFormComponent, FilterQueryComponent
} from '@app/_shared';

@NgModule({
  declarations: [
    ShowMessageComponent,
    WCMapComponent,
    UserFormComponent,
    PasswordFormComponent,
    FilterQueryComponent
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
    FilterQueryComponent
  ]
})
export class SharedModule { }
