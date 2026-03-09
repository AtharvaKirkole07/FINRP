import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserpagesRoutingModule } from './userpages-routing-module';
import { Userkycpage } from './userkycpage/userkycpage';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UserpagesRoutingModule,
    Userkycpage
  ]
})
export class UserpagesModule { }
