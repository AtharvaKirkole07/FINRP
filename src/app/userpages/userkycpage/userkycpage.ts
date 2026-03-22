import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { KycService } from '../serviceInterface/KycService';
import { AuthService } from '../../login/serviceinterface/auth.service'; 
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-userkycpage',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './userkycpage.html',
  styleUrl: './userkycpage.css',
})
export class Userkycpage implements OnInit {

  currentStep = 1;
  isSubmitting = false;
  submitError  = '';
  submitSuccess = '';
  userId: number | null = null;   // ← no longer hardcoded

  kycForm = {
    fullName: '',
    dob:      '',
    email:    '',
    mobile:   '',
    pan:      '',
    aadhaar:  '',
    address:  ''
  };

  documents: { [key: string]: File | null } = {
    panCard:         null,
    aadhaarFront:    null,
    aadhaarBack:     null,
    selfie:          null,
    electricityBill: null
  };

  uploadedFiles: { [key: string]: string | null } = {
    panCard:         null,
    aadhaarFront:    null,
    aadhaarBack:     null,
    selfie:          null,
    electricityBill: null
  };

  constructor(
    private kycService:  KycService,
    private authService: AuthService   // ← inject AuthService
  ) {}

  ngOnInit(): void {
    const username = this.authService.getLoggedInUsername();

    if (!username) {
      this.submitError = 'Session expired. Please login again.';
      return;
    }

    // fetch real userId from KYC service using logged-in username
    this.kycService.getIdByUsername(username).subscribe({
      next: (id) => {
        this.userId = id;
      },
      error: () => {
        this.submitError = 'Could not load user profile. Please try again.';
      }
    });
  }

  get uploadCount(): number {
    return Object.values(this.uploadedFiles).filter(v => v !== null).length;
  }

  triggerUpload(docType: string) {
    const input = document.getElementById('file-' + docType) as HTMLInputElement;
    if (input) input.click();
  }

  onFileSelected(event: any, docType: string) {
    const file: File = event.target.files[0];
    if (file) {
      this.documents[docType] = file;
      this.uploadedFiles[docType] = file.name;
      if (this.uploadCount >= 1) this.currentStep = 2;
    }
  }

 submitKyc() {
  this.submitError = '';
  this.submitSuccess = '';

  if (this.userId === null) {
    this.submitError = 'User profile not loaded yet. Please wait.';
    return;
  }

  if (!this.kycForm.fullName || !this.kycForm.pan || !this.kycForm.aadhaar) {
    this.submitError = 'Please fill Full Name, PAN and Aadhaar fields.';
    return;
  }

  this.isSubmitting = true;

  this.kycService.submitKyc(this.kycForm, this.documents, this.userId)
    .pipe(
      finalize(() => {
        this.isSubmitting = false;   // ✅ always runs
      })
    )
    .subscribe({
      next: (response) => {
        if (response.success === false) {
          this.submitError = response.message;
          return;
        }

        this.submitSuccess = `KYC submitted! Application ID: ${response.applicationId}`;
        this.currentStep = 3;  // ✅ move to success screen
      },
      error: (err) => {
        this.submitError = err.error?.message || 'Submission failed. Please try again.';
      }
    });
}
}