import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface KycSubmitResponse {
  success: boolean;
  message: string;
  applicationId: number;
  status: string;
  submittedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class KycService {

  private baseUrl = 'http://localhost:8088/api/kyc';

  constructor(private http: HttpClient) {}

  submitKyc(
    kycForm: {
      fullName: string;
      dob: string;
      email: string;
      mobile: string;
      pan: string;
      aadhaar: string;
      address: string;
    },
    documents: { [key: string]: File | null },
    userId: number
  ): Observable<KycSubmitResponse> {

    const formData = new FormData();

    formData.append('userId',   userId.toString());
    formData.append('fullName', kycForm.fullName);
    formData.append('dob',      kycForm.dob);
    formData.append('email',    kycForm.email);
    formData.append('mobile',   kycForm.mobile);
    formData.append('pan',      kycForm.pan);
    formData.append('aadhaar',  kycForm.aadhaar);
    formData.append('address',  kycForm.address);

    Object.keys(documents).forEach(key => {
      const file = documents[key];
      if (file) formData.append(key, file);
    });

    return this.http.post<KycSubmitResponse>(`${this.baseUrl}/submit`, formData);
  }

getIdByUsername(username: string): Observable<number> {
  return this.http.get<number>(`${this.baseUrl}/getusername?username=${username}`);
}
}