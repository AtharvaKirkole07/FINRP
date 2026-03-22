import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Grid card (list view) ────────────────────────────────────────────────────
export interface KycApplicationSummary {
  id: number;
  fullName: string;
  pan: string;
  address: string;
  status: string;
  submittedAt: string;
  docCount: number;
}

// ── Full detail (process page) ───────────────────────────────────────────────
export interface KycApplicationDetail {
  id: number;
  fullName: string;
  dob: string;
  email: string;
  mobile: string;
  pan: string;
  aadhaar: string;
  address: string;
  status: string;
  submittedAt: string;
  panCardPath: string;
  aadhaarFrontPath: string;
  aadhaarBackPath: string;
  selfiePath: string;
  electricityBillPath: string;
}


export interface KycL2QueueItem {
  auditId:       number;
  applicationId: number;
  fullName:      string;
  pan:           string;
  riskFlag:      string;   // LOW / MEDIUM / HIGH
  l2Status:      string;   // PENDING / APPROVED / REJECTED
  forwardedAt:   string;
  docCount:      number;
}

export interface KycL2ReviewDTO {
  auditId:       number;
  applicationId: number;
  fullName:      string;
  pan:           string;
  l1Notes:       string;
  l1Checklist:   string;          // raw JSON string from backend
  riskFlag:      string;
  l2Status:      string;
  l2Notes:       string;
  forwardedAt:   string;
  actionedAt:    string;

  // not yet in backend — keep optional so page doesn't crash
  dob?:                 string;
  email?:               string;
  mobile?:              string;
  aadhaar?:             string;
  address?:             string;
  submittedAt?:         string;
  panCardPath?:         string | null;
  aadhaarFrontPath?:    string | null;
  aadhaarBackPath?:     string | null;
  selfiePath?:          string | null;
  electricityBillPath?: string | null;
}

@Injectable({ providedIn: 'root' })
export class KycOfficerService {

  private base = 'http://localhost:8088';

  constructor(private http: HttpClient) {}

  getAllApplications(): Observable<KycApplicationSummary[]> {
    return this.http.get<KycApplicationSummary[]>(`${this.base}/api/kyc/applications`);
  }

    getApplicationDetails(id: string | number): Observable<KycApplicationDetail> {
    return this.http.get<KycApplicationDetail>(`${this.base}/api/kyc/applications/${id}`);
  }

  getDocumentUrl(id: number, docType: string): string {
    return `${this.base}/api/kyc/documents/${id}/${docType}`;
  }

  updateStatusFailure(applicationId: number, status: number): Observable<string> {
  return this.http.patch(
    `${this.base}/api/kyc/failure/${applicationId}/status?status=${status}`,
    {},
    { responseType: 'text' }
  );
  }

updateStatusSuccess(id: number, status: number): Observable<string> {
  return this.http.patch(
    `${this.base}/api/kyc/status?id=${id}&status=${status}`,
    {},
    { responseType: 'text' }
  );
}



  forwardToL2(applicationId: number, payload: {
  l1Notes:      string;
  l1Checklist:  string;   // JSON.stringify of checklist object
  riskFlag:     string;
}): Observable<{ success: boolean; message: string }> {
  return this.http.post<{ success: boolean; message: string }>(
    `${this.base}/api/kyc/forward/${applicationId}`,
    payload
  );
}


getL2Queue(): Observable<KycL2QueueItem[]> {
  return this.http.get<KycL2QueueItem[]>(`${this.base}/api/kyc/l2/queue`);
}


getAuditById(auditId: number) {
  return this.http.get<any>(`${this.base}/api/kyc/getAuditFormById/${auditId}`);
}



}