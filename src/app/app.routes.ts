import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard';
import { AuthGuard } from './login/serviceinterface/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },

  // kyc pages 
    {
    path: 'kyc',
    loadChildren: () =>
      import('./kyc-module/kyc-module-module')
        .then(m => m.KycModuleModule)
  },

  //user seen pages  . This is standalone compoenent so requires some more config

    {
    path: 'user',
    loadChildren: () =>
      import('./userpages/userpages-module')
        .then(m => m.UserpagesModule)
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];