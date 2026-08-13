import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TransactionReportRequest,
  TransactionReportResponse
} from '../Model/transaction-reports.model';

@Injectable({ providedIn: 'root' })
export class TransactionReportService {

  private readonly base = 'http://localhost:8088/api/reports';

  constructor(private http: HttpClient) {}

  generateReport(req: TransactionReportRequest): Observable<TransactionReportResponse> {
    return this.http.get<TransactionReportResponse>(
      `${this.base}/exportReport`,
      { params: this.toParams(req) }
    );
  }

  downloadCsv(req: TransactionReportRequest): Observable<Blob> {
    return this.http.get(`${this.base}/export`, {
      params: this.toParams(req),
      responseType: 'blob'
    });
  }

  private toParams(req: TransactionReportRequest): HttpParams {
    let params = new HttpParams();

    if (req.accountNumber)    params = params.set('accountNumber',    req.accountNumber);
    if (req.fromDate)         params = params.set('fromDate',         req.fromDate);
    if (req.toDate)           params = params.set('toDate',           req.toDate);
    if (req.day != null)      params = params.set('day',              req.day);
    if (req.month != null)    params = params.set('month',            req.month);
    if (req.year != null)     params = params.set('year',             req.year);
    if (req.transactionType)  params = params.set('transactionType',  req.transactionType);
    if (req.status)           params = params.set('status',           req.status);
    if (req.flaggedOnly)      params = params.set('flaggedOnly',       String(req.flaggedOnly));
    if (req.groupBy)          params = params.set('groupBy',          req.groupBy);

    return params;
  }
}