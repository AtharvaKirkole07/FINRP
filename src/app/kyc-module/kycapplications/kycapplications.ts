import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { KycApplicationSummary } from '../service/KycService';

export class KycApplication {
  id: string = '';
  refId: string = '';
  name: string = '';
  initials: string = '';
  pan: string = '';
  city: string = '';
  docs: number = 0;
  status: 'pending' | 'approved' | 'rejected' = 'pending';
  statusLabel: string = '';
  priority: 'normal' | 'urgent' = 'normal';
  submittedAt: string = '';
  colorTag: 'coral' | 'teal' | 'gold' | 'plum' | 'sage' = 'coral';
}

const COLOR_CYCLE: KycApplication['colorTag'][] = ['coral', 'teal', 'gold', 'plum', 'sage'];

@Component({
  selector: 'app-kyc-incoming',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kycapplications.html',
  styleUrl: './kycapplications.css',
})
export class KycIncomingComponent implements OnInit {

  today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short'
  });

  searchQuery  = '';
  activeFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  isLoading    = false;
  loadError    = '';
  applications: KycApplication[] = [];

  constructor(
    private router: Router,
    private route:  ActivatedRoute
  ) {}

  ngOnInit(): void {
    const data: KycApplicationSummary[] = this.route.snapshot.data['applications'];
    if (!data) {
      this.loadError = 'Failed to load applications.';
      return;
    }
    this.applications = data.map((item, i) => this.mapToCard(item, i));
  }

  loadApplications(): void {
    this.loadError = '';
    this.isLoading = true;
    this.router.navigate(['/kyc/kycapplication']);
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

    const rawStatus = item.status;
    const code      = rawStatus != null && rawStatus !== '' ? parseInt(rawStatus, 10) : null;

    if (code === null || isNaN(code)) {
      card.status      = 'pending';
      card.statusLabel = 'Awaiting Review';
      card.priority    = 'normal';
    } else if (code === 100) {
      card.status      = 'approved';
      card.statusLabel = 'Approved';
      card.priority    = 'normal';
    } else {
      card.status      = 'rejected';
      card.statusLabel = this.rejectionLabel(code);
      card.priority    = 'urgent';
    }

    return card;
  }

  private rejectionLabel(code: number): string {
    const labels: Record<number, string> = {
      20: 'Incomplete Docs',
      40: 'Address Mismatch',
      60: 'Doc Not Clear',
      80: 'Detail Mismatch',
      95: 'Fake Document'
    };
    return labels[code] ?? `Rejected (${code})`;
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
      const last       = parts[parts.length - 1].trim();
      return /^\d/.test(secondLast) ? last : secondLast.split('-')[0].trim();
    }
    return address.split(' ')[0];
  }

  get pendingCount()  { return this.applications.filter(a => a.status === 'pending').length; }
  get approvedCount() { return this.applications.filter(a => a.status === 'approved').length; }
  get rejectedCount() { return this.applications.filter(a => a.status === 'rejected').length; }

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

  setFilter(f: 'all' | 'pending' | 'approved' | 'rejected') { this.activeFilter = f; }

  openApplication(app: KycApplication) {
    this.router.navigate(['/kyc/kycprocess'], { queryParams: { id: app.id } });
  }
}