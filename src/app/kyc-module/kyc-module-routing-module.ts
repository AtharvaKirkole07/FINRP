import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KycUserProcesspageComponent } from './kyc-user-processpage/kyc-user-processpage';
import { KycApplication } from './kycapplications/kycapplications';
import { KycIncomingComponent } from './kycapplications/kycapplications';
const routes: Routes = [
   { path: 'kycprocess', component: KycUserProcesspageComponent },
   {path: 'kycapplication', component:KycIncomingComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KycModuleRoutingModule { }
