import { Component } from '@angular/core';

@Component({
  selector: 'app-kyc-user-processpage',
  templateUrl: './kyc-user-processpage.html',
  styleUrls: ['./kyc-user-processpage.css']
})
export class KycUserProcesspageComponent {

  applicant = {
    name: 'Rohan Sharma',
    dob: '14 Aug 1992',
    email: 'rohan@email.com',
    mobile: '+91 98765 43210',
    pan: 'ABCDE1234F',
    aadhaar: 'XXXX XXXX 5678'
  };

  documents = [
    { name: 'Aadhaar Card — Front', size: '1.2 MB', date: 'Uploaded Mar 04' },
    { name: 'Aadhaar Card — Back', size: '980 KB', date: 'Uploaded Mar 04' },
    { name: 'Selfie / Live Photo', size: '650 KB', date: 'Liveness Passed ✓' },
    { name: 'Signature', size: '210 KB', date: 'Drawn on app' }
  ];

}