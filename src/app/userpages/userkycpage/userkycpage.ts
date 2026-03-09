import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { KycService } from '../serviceInterface/KycService';

@Component({
  selector: 'app-userkycpage',
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './userkycpage.html',
  styleUrl: './userkycpage.css',
})
export class Userkycpage {

  currentStep = 1;
  isSubmitting = false;
  submitError = '';
  submitSuccess = '';
  userId = 1; // Replace with logged-in user's ID later

  kycForm = {
    fullName: '',
    dob: '',
    email: '',
    mobile: '',
    pan: '',
    aadhaar: '',
    address: ''
  };

  documents: { [key: string]: File | null } = {
    panCard: null,
    aadhaarFront: null,
    aadhaarBack: null,
    selfie: null,
    electricityBill: null
  };

  uploadedFiles: { [key: string]: string | null } = {
    panCard: null,
    aadhaarFront: null,
    aadhaarBack: null,
    selfie: null,
    electricityBill: null
  };

  constructor(private kycService: KycService) {}

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

  if (!this.kycForm.fullName || !this.kycForm.pan || !this.kycForm.aadhaar) {
    this.submitError = 'Please fill Full Name, PAN and Aadhaar fields.';
    return;
  }

  this.isSubmitting = true;

  this.kycService.submitKyc(this.kycForm, this.documents, this.userId)
    .subscribe({
      next: (response) => {
        this.isSubmitting = false;

        // ✅ Check explicitly for false, not just truthy
        if (response.success === false) {
          this.submitError = response.message;
          return;
        }

        // ✅ Success — move to step 3
        this.submitSuccess = `KYC submitted! Application ID: ${response.applicationId}`;
        this.currentStep = 3;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || 'Submission failed. Please try again.';
      },
      complete: () => {
        // ✅ Failsafe — ensure spinner never gets stuck
        this.isSubmitting = false;
      }
    });
}
}