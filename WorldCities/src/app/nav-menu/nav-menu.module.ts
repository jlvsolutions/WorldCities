import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@app/_shared/shared.module';

import { NavMenuComponent } from './nav-menu/nav-menu.component';



@NgModule({
  declarations: [
    NavMenuComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    NavMenuComponent
  ]
})
export class NavMenuModule { }
