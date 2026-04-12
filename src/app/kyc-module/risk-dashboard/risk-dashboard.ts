import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fraudService } from '../service/FraudService';
import {
  DashboardSummary,
  TransactionRisk,
  AccountRisk,
  TxnFilter,
  AcctFilter
} from './model/fraudStructure';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-risk-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './risk-dashboard.html',
  styleUrls: ['./risk-dashboard.css'],
})
export class RiskDashboard implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  summary: DashboardSummary | null = null;
  transactions: TransactionRisk[] = [];
  accounts: AccountRisk[] = [];

  txnFilter: TxnFilter = 'ALL';
  acctFilter: AcctFilter = 'ALL';

  loading = { summary: true, transactions: true, accounts: true };
  lastRefreshed: Date = new Date();

  // ✅ STRONGLY TYPED FILTERS (FIX)
  readonly txnFilters: { label: string; value: TxnFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Flagged', value: 'FLAGGED' },
    { label: 'Critical', value: 'CRITICAL' },
    { label: 'High', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low', value: 'LOW' },
  ];

  readonly acctFilters: { label: string; value: AcctFilter }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Blacklisted', value: 'BLACKLISTED' },
    { label: 'Noisy', value: 'NOISY' },
    { label: 'Watch', value: 'WATCH' },
    { label: 'Clean', value: 'CLEAN' },
  ];

  constructor(private fraudService: fraudService) {}

  ngOnInit(): void {
    this.loadAll();

    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadAll());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ SINGLE PIPELINE LOAD
  loadAll(): void {
    this.loading = { summary: true, transactions: true, accounts: true };

    const txnLevel =
      this.txnFilter !== 'ALL' && this.txnFilter !== 'FLAGGED'
        ? this.txnFilter
        : undefined;

    const acctLevel =
      this.acctFilter !== 'ALL'
        ? this.acctFilter
        : undefined;

    forkJoin({
      summary: this.fraudService.getSummary(),
      transactions: this.fraudService.getTransactions(txnLevel),
      accounts: this.fraudService.getAccounts(acctLevel)
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: res => {
        this.summary = res.summary;

        this.transactions =
          this.txnFilter === 'FLAGGED'
            ? res.transactions.filter(t => t.isFlagged)
            : res.transactions;

        this.accounts = res.accounts;

        this.loading = { summary: false, transactions: false, accounts: false };
        this.lastRefreshed = new Date();
      },
      error: () => {
        this.loading = { summary: false, transactions: false, accounts: false };
      }
    });
  }

  // ✅ NOW TYPE SAFE (NO ERROR)
  setTxnFilter(f: TxnFilter): void {
    this.txnFilter = f;
    this.loadAll();
  }

  setAcctFilter(f: AcctFilter): void {
    this.acctFilter = f;
    this.loadAll();
  }

  // ── UI HELPERS ─────────────────────────

  riskBadgeClass(level: string): string {
    const map: Record<string, string> = {
      LOW: 'fd-badge--low',
      MEDIUM: 'fd-badge--medium',
      HIGH: 'fd-badge--high',
      CRITICAL: 'fd-badge--critical',
    };
    return map[level] ?? 'fd-badge--low';
  }

  noiseBadgeClass(level: string): string {
    const map: Record<string, string> = {
      CLEAN: 'fd-badge--low',
      WATCH: 'fd-badge--medium',
      NOISY: 'fd-badge--high',
      BLACKLISTED: 'fd-badge--critical',
    };
    return map[level] ?? 'fd-badge--low';
  }

  scoreBarColor(score: number): string {
    if (score >= 86) return '#E24B4A';
    if (score >= 61) return '#D85A30';
    if (score >= 31) return '#EF9F27';
    return '#22c55e';
  }

  scoreBarWidth(score: number): string {
    return Math.min(score, 100) + '%';
  }

  shortRef(ref: string): string {
    return ref?.length > 14 ? ref.substring(0, 14) + '…' : ref;
  }

  relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}