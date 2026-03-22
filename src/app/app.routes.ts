import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard';
import { AuthGuard } from './login/LoginUtilities/AuthGuard';
import { SignupComponent } from './signup/signup';

export const routes: Routes = [
  { path: 'login',  component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'kyc',
    canActivate: [AuthGuard],          // protects ALL /kyc/* children
    loadChildren: () =>
      import('./kyc-module/kyc-module-module')
        .then(m => m.KycModuleModule)
  },
  {
    path: 'user',
    canActivate: [AuthGuard],          // protects ALL /user/* children
    loadChildren: () =>
      import('./userpages/userpages-module')
        .then(m => m.UserpagesModule)
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];