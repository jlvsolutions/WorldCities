import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AngularMaterialModule, GraphQLModule } from '@app/_shared';
import { ShowMessageComponent, WCMapComponent, UserFormComponent, PasswordFormComponent  } from '@app/_shared';

@NgModule({
  declarations: [
    ShowMessageComponent,
    WCMapComponent,
    UserFormComponent,
    PasswordFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AngularMaterialModule,
    GraphQLModule
  ],
  exports: [
    ReactiveFormsModule,
    RouterModule,
    AngularMaterialModule,
    ShowMessageComponent,
    WCMapComponent,
    UserFormComponent,
    PasswordFormComponent
  ]
})
export class SharedModule { }
