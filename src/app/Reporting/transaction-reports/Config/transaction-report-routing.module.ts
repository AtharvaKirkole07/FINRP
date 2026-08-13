import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionReportComponent } from '../transaction-reports';

const routes: Routes = [
 

   { path: 'reports', component: TransactionReportComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionRouting { }
