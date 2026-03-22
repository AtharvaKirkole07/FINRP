

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { KycL2QueueItem } from '../service/KycService';



export class L2Card {
  auditId:       number = 0;
  applicationId: number = 0;
  refId:         string = '';
  name:          string = '';
  initials:      string = '';
  pan:           string = '';
  docs:          number = 0;
  riskFlag:      string = 'LOW';
  l2Status:      'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
  statusLabel:   string = '';
  forwardedAt:   string = '';
  colorTag:      'coral' | 'teal' | 'gold' | 'plum' | 'sage' = 'coral';
}

const COLOR_CYCLE: L2Card['colorTag'][] = ['coral', 'teal', 'gold', 'plum', 'sage'];

@Component({
  selector: 'app-approval-applications',
  imports: [CommonModule,FormsModule],
  templateUrl: './approval-applications.html',
  styleUrl: './approval-applications.css',
})

export class ApprovalApplications implements OnInit {

  today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short'
  });

  searchQuery  = '';
  activeFilter: 'all' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'all';
  isLoading    = false;
  loadError    = '';
  cards: L2Card[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const data: KycL2QueueItem[] = this.route.snapshot.data['applications'];
    if (!data) { this.loadError = 'Failed to load L2 queue.'; return; }
    this.cards = data.map((item, i) => this.mapToCard(item, i));
  }

  private mapToCard(item: KycL2QueueItem, index: number): L2Card {
    const card         = new L2Card();
    card.auditId       = item.auditId;
    card.applicationId = item.applicationId;
    card.refId         = `L2-${new Date().getFullYear()}-${String(item.auditId).padStart(4, '0')}`;
    card.name          = item.fullName;
    card.initials      = this.getInitials(item.fullName);
    card.pan           = item.pan ?? '—';
    card.docs          = item.docCount;
    card.riskFlag      = item.riskFlag ?? 'LOW';
    card.forwardedAt   = item.forwardedAt;
    card.colorTag      = COLOR_CYCLE[index % COLOR_CYCLE.length];

    const s = (item.l2Status ?? 'PENDING').toUpperCase();
    if (s === 'APPROVED') {
      card.l2Status    = 'APPROVED';
      card.statusLabel = 'Approved';
    } else if (s === 'REJECTED') {
      card.l2Status    = 'REJECTED';
      card.statusLabel = 'Rejected';
    } else {
      card.l2Status    = 'PENDING';
      card.statusLabel = 'Awaiting L2';
    }
    return card;
  }

  private getInitials(name: string): string {
    if (!name) return '??';
    return name.trim().split(' ').filter(Boolean).slice(0, 2)
      .map(w => w[0].toUpperCase()).join('');
  }

  get pendingCount()  { return this.cards.filter(c => c.l2Status === 'PENDING').length; }
  get approvedCount() { return this.cards.filter(c => c.l2Status === 'APPROVED').length; }
  get rejectedCount() { return this.cards.filter(c => c.l2Status === 'REJECTED').length; }

  get filteredCards(): L2Card[] {
    return this.cards.filter(card => {
      const matchesFilter = this.activeFilter === 'all' || card.l2Status === this.activeFilter;
      const q = this.searchQuery.toLowerCase();
      const matchesSearch = !q ||
        card.name.toLowerCase().includes(q) ||
        card.pan.toLowerCase().includes(q)  ||
        card.refId.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }

  setFilter(f: 'all' | 'PENDING' | 'APPROVED' | 'REJECTED') { this.activeFilter = f; }


  openApplication(card: L2Card): void {
  this.router.navigate(
    ['/kyc/kycfinalprocess'],   // ✅ clean route name (change this)
    { queryParams: { auditId: card.auditId } }
  );
}

  reload(): void { this.router.navigate(['/kyc/kycapproval']); }
}