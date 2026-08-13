import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {

  modules = [
    { name: 'KYC L1 Applications', icon: '👤', link: 'kyc/kycapplication' },
    { name: 'KYC L2 Applications', icon: '👤', link: 'kyc/kycapproval' },
    { name: 'KYC Reports', icon: '👤', link: '/report/reports' },
    { name: 'KYC Risk Dashboard', icon: '👤', link: '/risk/riskdashboard' },
  ];

  constructor(private router: Router) {}   // ← inject Router

  navigate(link: string): void {
    this.router.navigate([link]);
  }
}