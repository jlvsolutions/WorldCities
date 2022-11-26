import { NgModule } from '@angular/core';
import { SharedModule } from '@app/_shared/shared.module';
import { HomeComponent } from './home/home.component';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    SharedModule
  ],
  exports: [
    SharedModule,
    HomeComponent
  ]
})
export class HomeModule { }
