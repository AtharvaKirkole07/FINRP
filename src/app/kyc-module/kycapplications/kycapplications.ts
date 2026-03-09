import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { KycOfficerService, KycApplicationSummary } from '../service/KycService';
import { NavigationEnd} from '@angular/router';
import {OnDestroy } from '@angular/core';
import { Subscription, filter } from 'rxjs';

export class KycApplication {
  id: string = '';
  refId: string = '';
  name: string = '';
  initials: string = '';
  pan: string = '';
  city: string = '';
  docs: number = 0;
  status: 'pending' | 'urgent' | 'review' = 'pending';
  statusLabel: string = '';
  priority: 'normal' | 'urgent' = 'normal';
  submittedAt: string = '';
  colorTag: 'coral' | 'teal' | 'gold' | 'plum' | 'sage' = 'coral';
}

const COLOR_CYCLE: KycApplication['colorTag'][] = ['coral', 'teal', 'gold', 'plum', 'sage'];

@Component({
  selector: 'app-kyc-incoming',
  imports: [CommonModule, FormsModule],
  templateUrl: './kycapplications.html',
  styleUrl: './kycapplications.css',
})
export class KycIncomingComponent implements OnInit,OnDestroy {

    private routerSub!: Subscription;

  today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short'
  });

  searchQuery  = '';
  activeFilter: 'all' | 'pending' | 'urgent' | 'review' = 'all';
  isLoading    = true;
  loadError    = '';
  applications: KycApplication[] = [];

  constructor(
    private router: Router,
    private kycOfficerService: KycOfficerService,
        // ← inject change detector
  ) {}

  ngOnInit(): void {

// Intial fetch
    this.loadApplications();


// ✅ Reload data every time user navigates back to this page
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadApplications();
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.loadError = '';

    this.kycOfficerService.getAllApplications().subscribe({
      next: (data) => {
        this.applications = data.map((item, index) => this.mapToCard(item, index));
        this.isLoading = false;
               // ← force UI update
      },
      error: (err) => {
        this.loadError = 'Failed to load applications. Please refresh.';
        this.isLoading = false;
              // ← force UI update on error too
        console.error('Load error:', err);
      }
    });
  }

  private mapToCard(item: KycApplicationSummary, index: number): KycApplication {
    const card = new KycApplication();
    card.id          = item.id.toString();
    card.refId       = `KYC-${new Date().getFullYear()}-${String(item.id).padStart(4, '0')}`;
    card.name        = item.fullName;
    card.initials    = this.getInitials(item.fullName);
    card.pan         = item.pan ?? '—';
    card.city        = this.extractCity(item.address);
    card.docs        = item.docCount;
    card.submittedAt = item.submittedAt;
    card.colorTag    = COLOR_CYCLE[index % COLOR_CYCLE.length];

    const s = (item.status ?? 'PENDING').toUpperCase();
    if (s === 'URGENT') {
      card.status = 'urgent'; card.statusLabel = 'Urgent'; card.priority = 'urgent';
    } else if (s === 'REVIEW' || s === 'IN_REVIEW') {
      card.status = 'review'; card.statusLabel = 'In Review'; card.priority = 'normal';
    } else {
      card.status = 'pending'; card.statusLabel = 'Pending Review'; card.priority = 'normal';
    }
    return card;
  }

  private getInitials(name: string): string {
    if (!name) return '??';
    return name.trim().split(' ').filter(Boolean).slice(0, 2)
      .map(w => w[0].toUpperCase()).join('');
  }

  private extractCity(address: string): string {
    if (!address) return '—';
    const parts = address.split(',');
    if (parts.length >= 2) {
      const secondLast = parts[parts.length - 2].trim();
      const last = parts[parts.length - 1].trim();
      return /^\d/.test(secondLast) ? last : secondLast.split('-')[0].trim();
    }
    return address.split(' ')[0];
  }

  get pendingCount() { return this.applications.filter(a => a.status === 'pending').length; }
  get urgentCount()  { return this.applications.filter(a => a.priority === 'urgent').length; }

  get filteredApplications(): KycApplication[] {
    return this.applications.filter(app => {
      const matchesFilter = this.activeFilter === 'all' || app.status === this.activeFilter;
      const q = this.searchQuery.toLowerCase();
      const matchesSearch = !q ||
        app.name.toLowerCase().includes(q) ||
        app.pan.toLowerCase().includes(q)  ||
        app.refId.toLowerCase().includes(q)||
        app.city.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }

  setFilter(f: 'all' | 'pending' | 'urgent' | 'review') { this.activeFilter = f; }

  openApplication(app: KycApplication) {
    this.router.navigate(['/kyc/kycprocess'], { queryParams: { id: app.id } });
  }
}