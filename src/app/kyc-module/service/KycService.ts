// src/app/kyc-module/serviceInterface/KycOfficerService.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface KycApplicationSummary {
  id: number;
  fullName: string;
  pan: string;
  address: string;
  status: string;
  submittedAt: string;
  docCount: number;
}

@Injectable({ providedIn: 'root' })
export class KycOfficerService {

  private baseUrl = 'http://localhost:8089/api/kyc';

  constructor(private http: HttpClient) {}

  getAllApplications(): Observable<KycApplicationSummary[]> {
    return this.http.get<KycApplicationSummary[]>(`${this.baseUrl}/applications`);
  }
}