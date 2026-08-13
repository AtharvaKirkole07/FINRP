import { Component, OnInit, OnDestroy, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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

  constructor(
    private fraudService: fraudService,
    private cdr: ChangeDetectorRef,
    // ✅ FIX 1: Guard against SSR — ngOnInit runs on the server during hydration.
    // HTTP calls are abandoned before completion, leaving the component stuck
    // in the loading state. isPlatformBrowser ensures loadAll() only fires in browser.
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // ✅ FIX 1 applied: only run in browser context
    if (isPlatformBrowser(this.platformId)) {
      this.loadAll();

      interval(30000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAll());
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

        // ✅ FIX 2: Force change detection after async data arrives.
        // Without this, Angular may not mark the view dirty after forkJoin emits,
        // leaving the template rendering stale loading state.
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = { summary: false, transactions: false, accounts: false };
        this.cdr.detectChanges();
      }
    });
  }

  setTxnFilter(f: TxnFilter): void {
    this.txnFilter = f;
    this.loadAll();
  }

  setAcctFilter(f: AcctFilter): void {
    this.acctFilter = f;
    this.loadAll();
  }

  // ── UI HELPERS ──────────────────────────────────────────────────────────────

  riskBadgeClass(level: string): string {
    const map: Record<string, string> = {
      LOW: 'badge--low',
      MEDIUM: 'badge--medium',
      HIGH: 'badge--high',
      CRITICAL: 'badge--critical',
    };
    return map[level] ?? 'badge--low';
  }

  noiseBadgeClass(level: string): string {
    const map: Record<string, string> = {
      CLEAN: 'badge--low',
      WATCH: 'badge--medium',
      NOISY: 'badge--high',
      BLACKLISTED: 'badge--critical',
    };
    return map[level] ?? 'badge--low';
  }

  scoreBarColor(score: number): string {
    if (score >= 86) return 'var(--score-critical)';
    if (score >= 61) return 'var(--score-high)';
    if (score >= 31) return 'var(--score-medium)';
    return 'var(--score-low)';
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

  get isAnyLoading(): boolean {
    return this.loading.summary || this.loading.transactions || this.loading.accounts;
  }
}