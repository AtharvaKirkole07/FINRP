import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TransactionService,
  TransactionRequest,
  TransactionType,
  TransferMode,
  Account
} from '../serviceInterface/TransactionService';

export type Step = 1 | 2 | 3;

export interface MockUser {
  username: string;
  acct: string;
  color: string;
  initials: string;
}

export interface TransactionState {
  step: Step;
  type: TransactionType | null;
  mode: TransferMode;
  selectedUser: MockUser | null;
  internalAmount: number | null;
  externalAmount: number | null;
  intDesc: string;
  extDesc: string;
  upiName: string;
  upiId: string;
  bankName: string;
  bankAcct: string;
  bankIfsc: string;
}

@Component({
  selector: 'app-transaction-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-user.html',
  styleUrl: './transaction-user.css',
})
export class TransactionUser implements OnInit {

  constructor(private txnService: TransactionService) {}

  modes: TransferMode[] = ['UPI', 'NEFT', 'IMPS', 'RTGS'];

  currentUser    = 'user_6';
  accountNumber  = '';
  balance        = 0;
  todayTransfers = 12000;
  dailyLimit     = 100000;

  get limitRemaining(): number {
    return this.dailyLimit - this.todayTransfers;
  }

  state: TransactionState = this.freshState();
isProcessing = false;
  userAccounts: Account[]   = [];
  allUsers: MockUser[]      = [];
  filteredUsers: MockUser[] = [];
  searchQuery  = '';
  showDropdown = false;
  submitted    = false;
  referenceId  = '';

  // ── LIFECYCLE ────────────────────────────────────────────

  ngOnInit(): void {
    this.loadAccounts();
    this.loadUsers();
  }

  loadAccounts(): void {
    const userId = 6;
    this.txnService.getMyAccounts(userId).subscribe({
      next: (res) => {
        this.userAccounts = res;
        if (res.length > 0) {
          this.accountNumber = res[0].accountNumber;
          this.balance       = res[0].balance;
        }
      },
      error: (err) => console.error('Failed to load accounts', err)
    });
  }

  loadUsers(): void {
    const currentUserId = 6;
    this.txnService.getInternalUsers(currentUserId).subscribe({
      next: (res) => {
        this.allUsers = res.map(u => ({
          username: u.username,
          acct:     u.accountNumber,
          color:    '#7aadff',
          initials: u.username.substring(0, 2).toUpperCase()
        }));
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }

  // ── STATE ────────────────────────────────────────────────

  freshState(): TransactionState {
    return {
      step: 1,
      type: null,
      mode: 'UPI',
      selectedUser: null,
      internalAmount: null,
      externalAmount: null,
      intDesc: '',
      extDesc: '',
      upiName: '',
      upiId: '',
      bankName: '',
      bankAcct: '',
      bankIfsc: ''
    };
  }

  setMode(mode: TransferMode): void { this.state.mode = mode; }
  goStep(n: Step): void             { this.state.step = n; }

  selectType(type: TransactionType): void {
    this.state.type         = type;
    this.searchQuery        = '';
    this.filteredUsers      = [];
    this.showDropdown       = false;
    this.state.selectedUser = null;
  }

  // ── USER SEARCH ──────────────────────────────────────────

  onSearchInput(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredUsers = [];
      this.showDropdown  = false;
      return;
    }
    this.filteredUsers = this.allUsers.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.acct.toLowerCase().includes(q)
    );
    this.showDropdown = this.filteredUsers.length > 0;
  }

  selectUser(user: MockUser): void {
    this.state.selectedUser = user;
    this.searchQuery        = user.username;
    this.showDropdown       = false;
    this.filteredUsers      = [];
  }

  clearUser(): void {
    this.state.selectedUser = null;
    this.searchQuery        = '';
  }

  // ── VALIDATION ───────────────────────────────────────────

  get step1Valid(): boolean {
    return this.state.type !== null;
  }

  get step2Valid(): boolean {
    if (this.state.type === 'INTERNAL') {
      return !!this.state.selectedUser &&
             !!this.state.internalAmount &&
             this.state.internalAmount > 0;
    }

    const amtValid = !!this.state.externalAmount && this.state.externalAmount > 0;

    if (this.state.mode === 'UPI') {
      return amtValid &&
             this.state.upiName.trim().length > 0 &&
             this.state.upiId.trim().length > 0;
    }

    return amtValid &&
           this.state.bankName.trim().length > 0 &&
           this.state.bankAcct.trim().length > 0 &&
           this.state.bankIfsc.trim().length > 0;
  }

  // ── REVIEW GETTERS ───────────────────────────────────────

  get reviewAmount(): number {
    return this.state.type === 'INTERNAL'
      ? (this.state.internalAmount ?? 0)
      : (this.state.externalAmount ?? 0);
  }

  get reviewFee(): number   { return this.state.type === 'INTERNAL' ? 0 : 5; }
  get reviewTotal(): number { return this.reviewAmount + this.reviewFee; }

  get reviewReceiverName(): string {
    if (this.state.type === 'INTERNAL') return this.state.selectedUser?.username ?? '';
    return this.state.mode === 'UPI' ? this.state.upiName : this.state.bankName;
  }

  get reviewReceiverSub(): string {
    if (this.state.type === 'INTERNAL') return this.state.selectedUser?.acct ?? '';
    if (this.state.mode === 'UPI')      return this.state.upiId;
    return `${this.state.bankAcct} · ${this.state.bankIfsc}`;
  }

  get reviewDesc(): string {
    return this.state.type === 'INTERNAL' ? this.state.intDesc : this.state.extDesc;
  }

  get reviewCreditTarget(): string {
    if (this.state.type === 'INTERNAL') return this.state.selectedUser?.username ?? '';
    return this.state.mode === 'UPI' ? this.state.upiId : this.state.bankAcct;
  }

  get modeLimitText(): string {
    const limits: Record<TransferMode, string> = {
      UPI:  'Limit: ₹ 1,00,000 / day',
      NEFT: 'No upper limit · batch settled',
      IMPS: 'Limit: ₹ 5,00,000 / txn · instant',
      RTGS: 'Min ₹ 2,00,000 · real-time gross'
    };
    return limits[this.state.mode];
  }

  // ── SUBMIT ───────────────────────────────────────────────

  submitTransaction(): void {

  // 🔴 Prevent double click
  if (this.isProcessing) return;

  this.isProcessing = true;

  let payload: TransactionRequest;

  if (this.state.type === 'INTERNAL') {

    if (!this.state.selectedUser || !this.state.internalAmount) {
      this.isProcessing = false;
      return;
    }

    payload = {
      senderAccountNumber:   this.accountNumber,
      receiverAccountNumber: this.state.selectedUser.acct,
      amount:                this.state.internalAmount,
      transactionType:       'INTERNAL',
      description:           this.state.intDesc || undefined
    };

  } else {

    if (!this.state.externalAmount) {
      this.isProcessing = false;
      return;
    }

    payload = {
      senderAccountNumber: this.accountNumber,
      amount:              this.state.externalAmount,
      transactionType:     'EXTERNAL',
      transferMode:        this.state.mode,
      description:         this.state.extDesc || undefined,

      ...(this.state.mode === 'UPI'
        ? {
            beneficiaryName: this.state.upiName,
            upiId:           this.state.upiId
          }
        : {
            beneficiaryName:      this.state.bankName,
            beneficiaryAccountNo: this.state.bankAcct,
            beneficiaryIfsc:      this.state.bankIfsc.toUpperCase()
          }
      )
    };
  }

 if (this.state.type === 'EXTERNAL') {
  this.submitted = true;
}

// Call API in background
this.txnService.initiateTransaction(payload).subscribe({
  next: (res) => {
    console.log('✅ RESPONSE:', res);

    this.referenceId = res?.referenceId || 'NA';
  },
  error: (err) => {
    console.error('❌ ERROR:', err);
    alert('Transfer failed');
  },
  complete: () => {
    this.isProcessing = false;
  }
});
}

  // ── RESET ────────────────────────────────────────────────

  resetAll(): void {
    this.state         = this.freshState();
    this.searchQuery   = '';
    this.filteredUsers = [];
    this.showDropdown  = false;
    this.submitted     = false;
    this.referenceId   = '';
  }

  formatINR(n: number): string {
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }
}