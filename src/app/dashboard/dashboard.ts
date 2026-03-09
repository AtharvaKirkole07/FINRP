import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../login/serviceinterface/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {

  modules = [
    { name: 'User Management', icon: '👤', link: 'user-management' },
    { name: 'Project Configuration', icon: '⚙️', link: 'project-config' },
    { name: 'Financial Overview', icon: '💰', link: 'financial' },
    { name: 'Reports & Analytics', icon: '📊', link: 'reports' },
    { name: 'Workflow Engine', icon: '🔄', link: 'workflow' },
    { name: 'Compliance & Audit', icon: '🛡️', link: 'compliance' },
    { name: 'Notifications Center', icon: '🔔', link: 'notifications' },
    { name: 'System Settings', icon: '🧩', link: 'settings' }
  ];

}