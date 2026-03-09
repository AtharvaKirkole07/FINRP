import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Userkycpage } from './userkycpage/userkycpage';

const routes: Routes = [

 {path:'userkyc', component:Userkycpage},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserpagesRoutingModule { }

