export type GroupBy = 'DAY' | 'MONTH' | 'YEAR';
export type TxnType = 'INTERNAL' | 'EXTERNAL';
export type TxnStatus = 'INITIATED' | 'PENDING' | 'COMPLETED' | 'BLOCKED';

export interface TransactionReportRequest {
  accountNumber?: string;
  fromDate?: string;
  toDate?: string;
  day?: number;
  month?: number;
  year?: number;
  transactionType?: TxnType;
  status?: TxnStatus;
  flaggedOnly?: boolean;
  groupBy: GroupBy;
}

export interface TransactionSummary {
  totalCount: number;
  totalAmount: number;
  internalCount: number;
  internalAmount: number;
  externalCount: number;
  externalAmount: number;
  completedCount: number;
  pendingCount: number;
  blockedCount: number;
  flaggedCount: number;
  flaggedAmount: number;
  avgTransactionAmount: number;
  maxTransactionAmount: number;
  minTransactionAmount: number;
}

export interface TransactionPeriodBreakdown {
  period: string;
  count: number;
  totalAmount: number;
  flaggedCount: number;
  flaggedAmount: number;
  internalCount: number;
  externalCount: number;
}

export interface TransactionRow {
  referenceId: string;
  senderAccountNumber: string;
  receiverAccountNumber: string;
  amount: number;
  transactionType: string;
  status: string;
  isFlagged: boolean;
  flaggedReason: string | null;
  description: string | null;
  createdAt: string;
}

export interface TransactionReportResponse {
  accountNumber: string | null;
  fromDate: string;
  toDate: string;
  groupBy: string;
  summary: TransactionSummary;
  breakdown: TransactionPeriodBreakdown[];
  transactions: TransactionRow[];
}