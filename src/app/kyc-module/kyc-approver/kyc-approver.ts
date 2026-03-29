import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { KycOfficerService, KycL2ReviewDTO } from '../service/KycService';

export interface DocSlot {
  docType:     string;
  displayName: string;
  path:        string | null;
}

@Component({
  selector: 'app-kyc-l2-processpage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kyc-approver.html',
  styleUrls: ['./kyc-approver.css']
})
export class KycApproval implements OnInit {

  reviewData: KycL2ReviewDTO | null = null;
  docSlots:   DocSlot[] = [];
  isLoading   = true;
  loadError   = '';

  checklistLabels: Record<string, string> = {
    docClear:         'Document clear & not blurred',
    nameMatch:        'Name matches across all documents',
    dobMatch:         'DOB matches submitted info',
    faceMatch:        'Selfie vs ID face match',
    signatureVisible: 'Signature visible',
    noTampering:      'No evidence of tampering',
    addressMatch:     'Address proof matches'
  };

  l2Notes           = '';
  l2RejectionReason = '';
  actionStatus: 'idle' | 'approving' | 'rejecting' = 'idle';
  actionMessage     = '';

  activeDocUrl:  string | null = null;
  safeDocUrl:    SafeResourceUrl | null = null;
  activeDocName  = '';
  activeDocType: 'image' | 'pdf' | null = null;

  constructor(
    private route:      ActivatedRoute,
    private router:     Router,
    private kycService: KycOfficerService,
    private cdr:        ChangeDetectorRef,
    private sanitizer:  DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

 ngOnInit(): void {
  if (!isPlatformBrowser(this.platformId)) {
    this.isLoading = false;
    return;
  }

  const auditId = this.route.snapshot.queryParamMap.get('auditId');
  if (!auditId) {
    this.loadError = 'No audit ID provided.';
    this.isLoading = false;
    return;
  }

  this.kycService.getAuditById(Number(auditId)).subscribe({
    next: (data) => {
      this.reviewData = data as KycL2ReviewDTO;
      // this.buildDocSlots(this.reviewData);
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error(err);
      this.loadError = 'Could not load review data.';
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}

  // private buildDocSlots(dto: KycL2ReviewDTO): void {
  //   this.docSlots = [
  //     { docType: 'panCard',         displayName: 'PAN Card',            path: dto.panCardPath },
  //     { docType: 'aadhaarFront',    displayName: 'Aadhaar — Front',     path: dto.aadhaarFrontPath },
  //     { docType: 'aadhaarBack',     displayName: 'Aadhaar — Back',      path: dto.aadhaarBackPath },
  //     { docType: 'selfie',          displayName: 'Selfie / Live Photo',  path: dto.selfiePath },
  //     { docType: 'electricityBill', displayName: 'Address Proof / Bill', path: dto.electricityBillPath },
  //   ];
  // }


  // ── L1 checklist helpers ────────────────────────────────────────
get l1ChecklistEntries(): { key: string; label: string; value: boolean }[] {
  if (!this.reviewData?.l1Checklist) return [];

  let parsed: Record<string, boolean> = {};
  try {
    parsed = JSON.parse(this.reviewData.l1Checklist);
  } catch {
    return [];
  }

  return Object.entries(parsed).map(([key, value]) => ({
    key,
    label: this.checklistLabels[key] ?? key,
    value
  }));
}

  get l1ChecklistCount(): number { return this.l1ChecklistEntries.filter(e => e.value).length; }
  get l1ChecklistTotal(): number { return this.l1ChecklistEntries.length; }

  get riskColor(): string {
    switch (this.reviewData?.riskFlag) {
      case 'LOW':    return 'risk-low';
      case 'MEDIUM': return 'risk-medium';
      case 'HIGH':   return 'risk-high';
      default:       return '';
    }
  }

get alreadyActioned(): boolean {
  const status = this.reviewData?.l2Status;
  return status === 'KYC_Completed' || status === 'KYC_Rejected';
}
  // ── Document viewer ─────────────────────────────────────────────
  getFilename(path: string): string {
    return path.split(/[\\/]/).pop() ?? path;
  }

  viewDocument(slot: DocSlot): void {
    if (!this.reviewData || !slot.path) {
      alert(`${slot.displayName} has not been uploaded.`);
      return;
    }
    const ext = slot.path.split('.').pop()?.toLowerCase() ?? '';
    this.activeDocType = ext === 'pdf' ? 'pdf' : 'image';
    this.activeDocName = slot.displayName;
    this.activeDocUrl  = this.kycService.getDocumentUrl(this.reviewData.applicationId, slot.docType);
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

approveKyc(): void {
  console.log('approveKyc clicked');
  console.log('reviewData:', this.reviewData);
  console.log('alreadyActioned:', this.alreadyActioned);

  if (!this.reviewData) {
    console.log('BLOCKED — reviewData is null');
    return;
  }

  const username = this.kycService.getLoggedInUsername();
  console.log('username from JWT:', username);

  this.actionStatus  = 'approving';
  this.actionMessage = '';
  this.cdr.detectChanges();

  this.kycService.FinalApproval(
    this.reviewData.auditId,
    'KYC_Completed',
    username
  ).subscribe({
    next: (res) => {
      console.log('Approval success:', res);
      this.actionStatus  = 'idle';
      this.actionMessage = '✓ KYC Approved — Final approval recorded.';
      if (this.reviewData) this.reviewData.l2Status = 'KYC_Completed';
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Approval error:', err);
      this.actionStatus  = 'idle';
      this.actionMessage = '✗ Approval failed. Please try again.';
      this.cdr.detectChanges();
    }
  });
}

rejectKyc(): void {
  if (!this.reviewData) return;
  if (!this.l2RejectionReason) {
    this.actionMessage = '⚠ Please select a rejection reason.';
    return;
  }
  this.actionStatus  = 'rejecting';
  this.actionMessage = '';
  this.cdr.detectChanges();

  const username = this.kycService.getLoggedInUsername();  // ← from JWT

  this.kycService.FinalApproval(
    this.reviewData.auditId,
    'KYC_Rejected',
    username
  ).subscribe({
    next: () => {
      this.actionStatus  = 'idle';
      this.actionMessage = `✗ KYC Rejected — Reason: "${this.l2RejectionReason}"`;
      if (this.reviewData) this.reviewData.l2Status = 'KYC_Rejected';
      this.cdr.detectChanges();
    },
    error: () => {
      this.actionStatus  = 'idle';
      this.actionMessage = '✗ Rejection failed. Please try again.';
      this.cdr.detectChanges();
    }
  });
}

  goBack(): void { this.router.navigate(['/kyc/kycapproval']); }
}