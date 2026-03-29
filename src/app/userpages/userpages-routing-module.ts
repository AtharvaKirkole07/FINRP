import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Userkycpage } from './userkycpage/userkycpage';
import { TransactionUser } from './transaction-user/transaction-user';

const routes: Routes = [

 {path:'userkyc', component:Userkycpage},
 {path:'usertransaction',component:TransactionUser}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserpagesRoutingModule { }

