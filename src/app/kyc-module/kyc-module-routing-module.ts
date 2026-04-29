import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KycUserProcesspageComponent } from './kyc-user-processpage/kyc-user-processpage';
import { KycApplication } from './kycapplications/kycapplications';
import { KycIncomingComponent } from './kycapplications/kycapplications';
import { KycApplicationResolver } from './resolver/kycapplication.resolver';
import { ApprovalApplications } from './approval-applications/approval-applications';
import { KycLevel2ApplicationResolver } from './resolver/kycLevel2Application.resolver';
import { KycApproval } from './kyc-approver/kyc-approver';
import { RiskDashboard } from './risk-dashboard/risk-dashboard';


const routes: Routes = [
   { path: 'kycprocess', component: KycUserProcesspageComponent },
  //Parent path here 
   {
    path: 'kycapplication',
    component: KycIncomingComponent,
    resolve: {
      applications: KycApplicationResolver
    }
  },
     { path: 'kycapproval', component: ApprovalApplications ,
       resolve: { applications: KycLevel2ApplicationResolver }
     },

        { path: 'kycfinalprocess', component: KycApproval },
         { path: 'riskdashboard', component: RiskDashboard },




];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KycModuleRoutingModule { }
