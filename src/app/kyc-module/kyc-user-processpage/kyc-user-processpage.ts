import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { KycOfficerService, KycApplicationDetail } from '../service/KycService';

export interface DocSlot {
  docType: string;
  displayName: string;
  path: string | null;
}

@Component({
  selector: 'app-kyc-user-processpage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kyc-user-processpage.html',
  styleUrls: ['./kyc-user-processpage.css']
})
export class KycUserProcesspageComponent implements OnInit {

  applicant: KycApplicationDetail | null = null;
  docSlots:  DocSlot[] = [];
  isLoading  = true;
  loadError  = '';

  checklist = {
    docClear:         false,
    nameMatch:        false,
    dobMatch:         false,
    faceMatch:        false,
    signatureVisible: false,
    noTampering:      false,
    addressMatch:     false
  };

  reviewerNotes   = '';
  rejectionReason = '';

  actionStatus: 'idle' | 'approving' | 'rejecting' = 'idle';
  actionMessage  = '';
  forwardingToL2 = false;          // ← spinner state for approve button

  activeDocUrl:  string | null = null;
  safeDocUrl:    SafeResourceUrl | null = null;
  activeDocName  = '';
  activeDocType: 'image' | 'pdf' | null = null;

  private readonly rejectionCodeMap: Record<string, number> = {
    'Document not clear':      60,
    'Mismatch in details':     80,
    'Suspected fake document': 95,
    'Incomplete documents':    20,
    'Address proof mismatch':  40
  };

  constructor(
    private route:      ActivatedRoute,
    private router:     Router,
    private kycService: KycOfficerService,
    private cdr:        ChangeDetectorRef,
    private sanitizer:  DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (!id) {
      this.loadError = 'No application ID provided.';
      this.isLoading = false;
      return;
    }

    this.kycService.getApplicationDetails(id).subscribe({
      next: (data) => {
        this.applicant = data;
        this.buildDocSlots(data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loadError = 'Could not load application.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildDocSlots(app: KycApplicationDetail): void {
    this.docSlots = [
      { docType: 'panCard',         displayName: 'PAN Card',            path: app.panCardPath },
      { docType: 'aadhaarFront',    displayName: 'Aadhaar — Front',     path: app.aadhaarFrontPath },
      { docType: 'aadhaarBack',     displayName: 'Aadhaar — Back',      path: app.aadhaarBackPath },
      { docType: 'selfie',          displayName: 'Selfie / Live Photo',  path: app.selfiePath },
      { docType: 'electricityBill', displayName: 'Address Proof / Bill', path: app.electricityBillPath },
    ];
  }

  // ── Derive risk from checklist completion % ─────────────────────
  private computeRiskFlag(): string {
    const pct = (this.checklistCount / this.checklistTotal) * 100;
    if (pct === 100) return 'LOW';
    if (pct >= 57)   return 'MEDIUM';
    return 'HIGH';
  }

 forwardToL2(): void {
  if (!this.applicant) return;

  if (this.checklistCount === 0) {
    this.actionMessage = '⚠ Please complete at least one checklist item before approving.';
    return;
  }

  this.forwardingToL2 = true;
  this.actionMessage  = '';

  const payload = {
    l1Notes:     this.reviewerNotes,
    l1Checklist: JSON.stringify(this.checklist),
    riskFlag:    this.computeRiskFlag()
  };

  this.kycService.forwardToL2(this.applicant.id, payload).subscribe({
    next: (res) => {
      if (res.success === false) {
        this.forwardingToL2 = false;
        this.actionMessage  = `⚠ ${res.message}`;
        this.cdr.detectChanges();           // ← unblock UI
        return;
      }

      this.kycService.updateStatusSuccess(this.applicant!.id, 99).subscribe({
        next: () => {
          this.forwardingToL2 = false;
          this.actionMessage  = '✓ Application forwarded to Senior Officer (L2) for final approval.';
          if (this.applicant) this.applicant.status = 'L1_FORWARDED';
          this.cdr.detectChanges();         // ← unblock UI
        },
        error: (err) => {
          this.forwardingToL2 = false;
          this.actionMessage  = '✗ Forwarded but status update failed. Contact support.';
          this.cdr.detectChanges();         // ← unblock UI
          console.error(err);
        }
      });
    },
    error: (err) => {
      this.forwardingToL2 = false;
      this.actionMessage  = `✗ ${err.error?.message ?? 'Forward failed. Please try again.'}`;
      this.cdr.detectChanges();             // ← unblock UI
      console.error(err);
    }
  });
}

rejectKyc(): void {
  if (!this.applicant) return;

  if (!this.rejectionReason) {
    this.actionMessage = '⚠ Please select a rejection reason before rejecting.';
    return;
  }

  const statusCode = this.rejectionCodeMap[this.rejectionReason];
  if (statusCode === undefined) {
    this.actionMessage = '⚠ Invalid rejection reason selected.';
    return;
  }

  this.actionStatus  = 'rejecting';
  this.actionMessage = '';
  this.cdr.detectChanges();                 // ← show "Rejecting…" immediately

  this.kycService.updateStatusFailure(this.applicant.id, statusCode).subscribe({
    next: () => {
      this.actionStatus  = 'idle';          // ← reset button text
      this.actionMessage = `✗ KYC rejected — Reason: "${this.rejectionReason}" (Code ${statusCode})`;
      if (this.applicant) this.applicant.status = 'REJECTED';
      this.cdr.detectChanges();             // ← unblock UI
    },
    error: (err) => {
      this.actionStatus  = 'idle';          // ← reset button text
      this.actionMessage = '✗ Rejection failed. Please try again.';
      this.cdr.detectChanges();             // ← unblock UI
      console.error(err);
    }
  });
}

  // ── Document viewer ─────────────────────────────────────────────
  getFilename(path: string): string {
    return path.split(/[\\/]/).pop() ?? path;
  }

  viewDocument(slot: DocSlot): void {
    if (!this.applicant || !slot.path) {
      alert(`${slot.displayName} has not been uploaded.`);
      return;
    }
    const ext = slot.path.split('.').pop()?.toLowerCase() ?? '';
    this.activeDocType = ext === 'pdf' ? 'pdf' : 'image';
    this.activeDocName = slot.displayName;
    this.activeDocUrl  = this.kycService.getDocumentUrl(this.applicant.id, slot.docType);
    this.safeDocUrl    = this.sanitizer.bypassSecurityTrustResourceUrl(this.activeDocUrl);
  }

  closeViewer(): void {
    this.activeDocUrl  = null;
    this.safeDocUrl    = null;
    this.activeDocName = '';
    this.activeDocType = null;
  }

  openInNewTab(): void {
    if (this.activeDocUrl) window.open(this.activeDocUrl, '_blank');
  }

  // ── Checklist helpers ───────────────────────────────────────────
  get checklistTotal(): number  { return Object.keys(this.checklist).length; }
  get checklistCount(): number  { return Object.values(this.checklist).filter(Boolean).length; }
  get allChecked():     boolean { return this.checklistCount === this.checklistTotal; }

  // Disable both buttons once forwarded
  get alreadyForwarded(): boolean {
    return this.applicant?.status === 'L1_FORWARDED';
  }

  goBack(): void { this.router.navigate(['/kyc/kycapplication']); }
}