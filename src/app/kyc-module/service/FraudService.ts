import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardSummary,
  TransactionRisk,
  AccountRisk
} from '../risk-dashboard/model/fraudStructure'

@Injectable({ providedIn: 'root' })
export class fraudService {

  private readonly base = 'http://localhost:8087/fraud/api';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/summary`);
  }

  getTransactions(riskLevel?: string, limit = 50): Observable<TransactionRisk[]> {
    let params = new HttpParams().set('limit', limit);
    if (riskLevel && riskLevel !== 'ALL' && riskLevel !== 'FLAGGED') {
      params = params.set('riskLevel', riskLevel);
    }
    return this.http.get<TransactionRisk[]>(`${this.base}/transactions`, { params });
  }

  getAccounts(noiseLevel?: string, limit = 20): Observable<AccountRisk[]> {
    let params = new HttpParams().set('limit', limit);
    if (noiseLevel && noiseLevel !== 'ALL') {
      params = params.set('noiseLevel', noiseLevel);
    }
    return this.http.get<AccountRisk[]>(`${this.base}/accounts`, { params });
  }
}