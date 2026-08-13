import { Component ,ChangeDetectorRef} from '@angular/core';
import { TransactionReportService } from '../transaction-reports/Service/transaction-reports.service';
import {
  GroupBy,
  TxnType,
  TxnStatus,
  TransactionReportRequest,
  TransactionReportResponse,
  TransactionRow
} from '../transaction-reports/Model/transaction-reports.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type DateMode = 'range' | 'day' | 'month' | 'year';

@Component({
  imports: [CommonModule, FormsModule],
    standalone: true,
  selector: 'app-transaction-report',
  templateUrl: './transaction-reports.html',
  styleUrls: ['./transaction-reports.css']
})
export class TransactionReportComponent {

  readonly Math = Math;

  // ── Filter state ───────────────────────────────────────────────────
  accountNumber  = '';
  dateMode: DateMode = 'month';
  fromDate       = '';
  toDate         = '';
  day: number | null   = null;
  month: number | null = new Date().getMonth() + 1;
  year: number         = new Date().getFullYear();
  transactionType: TxnType | '' = '';
  status: TxnStatus | ''        = '';
  flaggedOnly = false;
  groupBy: GroupBy = 'DAY';

  // ── Report state ───────────────────────────────────────────────────
  report: TransactionReportResponse | null = null;
  loading     = false;
  downloading = false;
  errorMsg    = '';
  generated   = false;

  // ── Table state ────────────────────────────────────────────────────
  sortColumn: keyof TransactionRow = 'createdAt';
  sortAsc     = false;
  searchText  = '';
  currentPage = 1;
  pageSize    = 15;

  // ── Options ────────────────────────────────────────────────────────
  readonly dateModes: { label: string; value: DateMode }[] = [
    { label: 'Date range', value: 'range' },
    { label: 'Single day', value: 'day'   },
    { label: 'Month',      value: 'month' },
    { label: 'Year',       value: 'year'  },
  ];

  readonly groupByOptions: { label: string; value: GroupBy }[] = [
    { label: 'By day',   value: 'DAY'   },
    { label: 'By month', value: 'MONTH' },
    { label: 'By year',  value: 'YEAR'  },
  ];

  readonly typeOptions: { label: string; value: TxnType | '' }[] = [
    { label: 'All types', value: ''         },
    { label: 'Internal',  value: 'INTERNAL' },
    { label: 'External',  value: 'EXTERNAL' },
  ];

  readonly statusOptions: { label: string; value: TxnStatus | '' }[] = [
    { label: 'All statuses', value: ''          },
    { label: 'Completed',    value: 'COMPLETED' },
    { label: 'Pending',      value: 'PENDING'   },
    { label: 'Blocked',      value: 'BLOCKED'   },
    { label: 'Initiated',    value: 'INITIATED' },
  ];

  readonly months = [
    { label: 'January',   value: 1  },
    { label: 'February',  value: 2  },
    { label: 'March',     value: 3  },
    { label: 'April',     value: 4  },
    { label: 'May',       value: 5  },
    { label: 'June',      value: 6  },
    { label: 'July',      value: 7  },
    { label: 'August',    value: 8  },
    { label: 'September', value: 9  },
    { label: 'October',   value: 10 },
    { label: 'November',  value: 11 },
    { label: 'December',  value: 12 },
  ];

  get years(): number[] {
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2, y - 3, y - 4];
  }

  get days(): number[] {
    const count = this.month && this.year
      ? new Date(this.year, this.month, 0).getDate()
      : 31;
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  constructor(
    private reportService: TransactionReportService,
  private cdr: ChangeDetectorRef 
  ) {}
  


  // ── Generate ───────────────────────────────────────────────────────
generate(): void {
  this.loading     = true;
  this.errorMsg    = '';
  this.report      = null;
  this.currentPage = 1;

  this.reportService.generateReport(this.buildRequest())
    .subscribe({
      next: data => {
        console.log('[Report] Response received:', data);
        this.report    = data;
        this.loading   = false;
        this.generated = true;
        this.cdr.detectChanges();    // ← add this
      },
      error: err => {
        console.error('[Report] Error:', err);
        this.errorMsg = 'Failed to generate report. Please try again.';
        this.loading  = false;
        this.cdr.detectChanges();    // ← add this too
      }
    });
}

  // ── Download CSV ───────────────────────────────────────────────────
  download(): void {
    this.downloading = true;
    this.reportService.downloadCsv(this.buildRequest())
      .subscribe({
        next: blob => {
          const url       = URL.createObjectURL(blob);
          const anchor    = document.createElement('a');
          anchor.href     = url;
          anchor.download = this.buildFilename();
          anchor.click();
          URL.revokeObjectURL(url);
          this.downloading = false;
        },
        error: err => {
          console.error('[Report] Download error:', err);
          this.downloading = false;
        }
      });
  }

  // ── Build request from filter state ───────────────────────────────
  private buildRequest(): TransactionReportRequest {
    const req: TransactionReportRequest = { groupBy: this.groupBy };

    if (this.accountNumber.trim()) req.accountNumber   = this.accountNumber.trim();
    if (this.transactionType)      req.transactionType = this.transactionType;
    if (this.status)               req.status          = this.status;
    if (this.flaggedOnly)          req.flaggedOnly      = true;

    switch (this.dateMode) {
      case 'range':
        if (this.fromDate) req.fromDate = this.fromDate;
        if (this.toDate)   req.toDate   = this.toDate;
        break;
      case 'day':
        if (this.day)   req.day   = this.day;
        if (this.month) req.month = this.month;
        req.year = this.year;
        break;
      case 'month':
        if (this.month) req.month = this.month;
        req.year = this.year;
        break;
      case 'year':
        req.year = this.year;
        break;
    }

    return req;
  }

  // ── Table helpers ──────────────────────────────────────────────────
  get filteredRows(): TransactionRow[] {
    if (!this.report) return [];
    let rows = [...this.report.transactions];

    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      rows = rows.filter(r =>
        r.referenceId.toLowerCase().includes(q) ||
        r.senderAccountNumber.toLowerCase().includes(q) ||
        r.receiverAccountNumber.toLowerCase().includes(q)
      );
    }

    rows.sort((a, b) => {
      const av = a[this.sortColumn] ?? '';
      const bv = b[this.sortColumn] ?? '';
      return this.sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return rows;
  }

  get pagedRows(): TransactionRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRows.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  sort(col: keyof TransactionRow): void {
    if (this.sortColumn === col) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = col;
      this.sortAsc    = true;
    }
  }

  sortIcon(col: string): string {
    if (this.sortColumn !== col) return '↕';
    return this.sortAsc ? '↑' : '↓';
  }

  // ── View helpers ───────────────────────────────────────────────────
  statusClass(status: string): string {
    const map: Record<string, string> = {
      COMPLETED: 'badge--success',
      PENDING:   'badge--warning',
      BLOCKED:   'badge--danger',
      INITIATED: 'badge--neutral',
    };
    return map[status] ?? 'badge--neutral';
  }

  typeClass(type: string): string {
    return type === 'INTERNAL' ? 'badge--info' : 'badge--purple';
  }

  formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  shortRef(ref: string): string {
    return ref.length > 16 ? ref.substring(0, 16) + '…' : ref;
  }

  private buildFilename(): string {
    const acct = this.accountNumber ? this.accountNumber + '_' : 'all_';
    return `txn_report_${acct}${new Date().toISOString().split('T')[0]}.csv`;
  }

  resetFilters(): void {
    this.accountNumber   = '';
    this.dateMode        = 'month';
    this.fromDate        = '';
    this.toDate          = '';
    this.day             = null;
    this.month           = new Date().getMonth() + 1;
    this.year            = new Date().getFullYear();
    this.transactionType = '';
    this.status          = '';
    this.flaggedOnly     = false;
    this.groupBy         = 'DAY';
    this.report          = null;
    this.generated       = false;
    this.searchText      = '';
  }
}