import { NgModule } from '@angular/core';
import { SharedModule } from '@app/_shared/shared.module';
import { NavMenuComponent } from './nav-menu/nav-menu.component';



@NgModule({
  declarations: [
    NavMenuComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    SharedModule,
    NavMenuComponent
  ]
})
export class NavMenuModule { }
