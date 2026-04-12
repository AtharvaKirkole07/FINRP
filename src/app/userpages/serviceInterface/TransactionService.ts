import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export type TransactionType = 'INTERNAL' | 'EXTERNAL';
export type TransferMode   = 'UPI' | 'NEFT' | 'IMPS' | 'RTGS';

export interface InternalUser {
  userId: number;
  username: string;
  email: string;
  accountNumber: string;
  balance: number;
  accountType: string;
}

export interface Account {
  id: number;
  userId: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

export interface TransactionRequest {
  senderAccountNumber: string;
  amount: number;
  transactionType: TransactionType;
  description?: string;

  // INTERNAL only
  receiverAccountNumber?: string;

  // EXTERNAL only
  beneficiaryName?: string;
  beneficiaryAccountNo?: string;
  beneficiaryIfsc?: string;
  upiId?: string;
  transferMode?: TransferMode;
}

export interface TransactionResponse {
  referenceId: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  private baseUrl = 'http://localhost:8088/api/transactions';

  constructor(private http: HttpClient) {}

  initiateTransaction(req: TransactionRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.baseUrl}/transactionStart`, req);
  }

    getMyAccounts(userId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/my/${userId}`);
  }

   getInternalUsers(excludeUserId: number): Observable<InternalUser[]> {
    return this.http.get<InternalUser[]>(
      `${this.baseUrl}/userDetailsForTransaction?excludeUserId=${excludeUserId}`
    );
  }

}