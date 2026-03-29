import { Component } from '@angular/core';
import {OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
export type TransactionType = 'INTERNAL' | 'EXTERNAL' | null;
export type TransferMode    = 'UPI' | 'NEFT' | 'IMPS' | 'RTGS';
export type Step            = 1 | 2 | 3;
 
export interface MockUser {
  username : string;
  acct     : string;
  color    : string;
  initials : string;
}
 
export interface TransactionState {
  step            : Step;
  type            : TransactionType;
  mode            : TransferMode;
  selectedUser    : MockUser | null;
  internalAmount  : number | null;
  externalAmount  : number | null;
  intDesc         : string;
  extDesc         : string;
  upiName         : string;
  upiId           : string;
  bankName        : string;
  bankAcct        : string;
  bankIfsc        : string;
}
@Component({
  selector: 'app-transaction-user',
  imports: [CommonModule,FormsModule],
  templateUrl: './transaction-user.html',
  styleUrl: './transaction-user.css',
})
export class TransactionUser {
// ── User / Account (will come from JWT / AccountService) ──
  currentUser    = 'atharva';
  accountNumber  = 'VF-000000042';
  balance        = 124500.00;
  todayTransfers = 12000.00;
  dailyLimit     = 100000.00;
 
  get limitRemaining(): number {
    return this.dailyLimit - this.todayTransfers;
  }
 
  // ── State ─────────────────────────────────────────────────
  state: TransactionState = this.freshState();
 
  // ── Mode limits ───────────────────────────────────────────
  modeLimits: Record<TransferMode, string> = {
    UPI  : 'Min ₹1 · Max ₹1,00,000 per transaction',
    NEFT : 'Min ₹1 · No upper limit · Batch processing',
    IMPS : 'Min ₹1 · Max ₹5,00,000 · 24×7 Instant',
    RTGS : 'Min ₹2,00,000 · No upper limit · Bank hours only'
  };
 
  platformFees: Record<TransferMode, number> = {
    UPI  : 0,
    NEFT : 2.50,
    IMPS : 5.00,
    RTGS : 25.00
  };
 
  // ── Mock users (replace with API call to auth service) ────
  allUsers: MockUser[] = [
    { username: 'rahul_sharma', acct: 'VF-000000018', color: '#3ecfb2', initials: 'RS' },
    { username: 'priya_desai',  acct: 'VF-000000031', color: '#c9a55a', initials: 'PD' },
    { username: 'siddharth_v',  acct: 'VF-000000056', color: '#7aadff', initials: 'SV' }
  ];
  filteredUsers : MockUser[] = [];
  searchQuery   : string     = '';
  showDropdown  : boolean    = false;
 
  // ── Success state ─────────────────────────────────────────
  submitted   = false;
  referenceId = '';
 
  ngOnInit(): void {}
 
  // ── Helpers ───────────────────────────────────────────────
  freshState(): TransactionState {
    return {
      step           : 1,
      type           : null,
      mode           : 'UPI',
      selectedUser   : null,
      internalAmount : null,
      externalAmount : null,
      intDesc        : '',
      extDesc        : '',
      upiName        : '',
      upiId          : '',
      bankName       : '',
      bankAcct       : '',
      bankIfsc       : ''
    };
  }
 
  // ── Step navigation ───────────────────────────────────────
  goStep(n: Step): void {
    this.state.step = n;
  }
 
  // ── Type selection ────────────────────────────────────────
  selectType(type: 'INTERNAL' | 'EXTERNAL'): void {
    this.state.type = type;
    // reset step-2 fields on type switch
    this.searchQuery        = '';
    this.filteredUsers      = [];
    this.showDropdown       = false;
    this.state.selectedUser = null;
  }
 
  // ── User search ───────────────────────────────────────────
  onSearchInput(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (q.length === 0) {
      this.filteredUsers = [];
      this.showDropdown  = false;
      return;
    }
    this.filteredUsers = this.allUsers.filter(u =>
      u.username.toLowerCase().includes(q) || u.acct.toLowerCase().includes(q)
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
 
  // ── Mode tabs ─────────────────────────────────────────────
  setMode(mode: TransferMode): void {
    this.state.mode = mode;
  }
 
  // ── Validation guards ─────────────────────────────────────
  get step1Valid(): boolean {
    return this.state.type !== null;
  }
 
  get step2Valid(): boolean {
    if (this.state.type === 'INTERNAL') {
      return this.state.selectedUser !== null
          && (this.state.internalAmount ?? 0) > 0;
    }
    const amt = (this.state.externalAmount ?? 0) > 0;
    if (this.state.mode === 'UPI') {
      return amt
          && this.state.upiName.trim().length > 0
          && this.state.upiId.trim().length > 0;
    }
    return amt
        && this.state.bankName.trim().length > 0
        && this.state.bankAcct.trim().length > 0
        && this.state.bankIfsc.trim().length > 0;
  }
 
  // ── Review computed values ────────────────────────────────
  get reviewAmount(): number {
    return this.state.type === 'INTERNAL'
      ? (this.state.internalAmount ?? 0)
      : (this.state.externalAmount ?? 0);
  }
 
  get reviewFee(): number {
    return this.state.type === 'INTERNAL' ? 0 : this.platformFees[this.state.mode];
  }
 
  get reviewTotal(): number {
    return this.reviewAmount + this.reviewFee;
  }
 
  get reviewReceiverName(): string {
    if (this.state.type === 'INTERNAL') return this.state.selectedUser?.username ?? '';
    return this.state.mode === 'UPI' ? this.state.upiName : this.state.bankName;
  }
 
  get reviewReceiverSub(): string {
    if (this.state.type === 'INTERNAL') return this.state.selectedUser?.acct ?? '';
    if (this.state.mode === 'UPI')      return this.state.upiId;
    return `${this.state.bankAcct} · ${this.state.bankIfsc.toUpperCase()}`;
  }
 
  get reviewCreditTarget(): string {
    return this.state.type === 'INTERNAL'
      ? (this.state.selectedUser?.username ?? '')
      : 'SYSTEM_TRANSIT';
  }
 
  get reviewDesc(): string {
    return this.state.type === 'INTERNAL' ? this.state.intDesc : this.state.extDesc;
  }
 
  get modeLimitText(): string {
    return this.modeLimits[this.state.mode];
  }
 
  // ── Submit ────────────────────────────────────────────────
  submitTransaction(): void {
    this.referenceId = 'VF-TXN-' + Date.now().toString(36).toUpperCase();
    this.submitted   = true;
    // TODO: call TransactionService.initiate(payload) and handle response
  }
 
  // ── Reset ─────────────────────────────────────────────────
  resetAll(): void {
    this.state        = this.freshState();
    this.searchQuery  = '';
    this.filteredUsers = [];
    this.showDropdown  = false;
    this.submitted    = false;
    this.referenceId  = '';
  }
 
  // ── Formatter ─────────────────────────────────────────────
  formatINR(n: number): string {
    return n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }
}

