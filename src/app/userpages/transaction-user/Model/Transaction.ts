export type TransactionType = 'INTERNAL' | 'EXTERNAL';
export type TransferMode = 'UPI' | 'NEFT' | 'IMPS' | 'RTGS';
export type Step = 1 | 2 | 3;

export interface MockUser {
  username: string;
  acct: string;
  color: string;
  initials: string;
}

export interface TransactionState {
  step: Step;
  type: TransactionType | null;
  mode: TransferMode;
  selectedUser: MockUser | null;

  internalAmount: number | null;
  externalAmount: number | null;

  intDesc: string;
  extDesc: string;

  // UPI
  upiName: string;
  upiId: string;

  // Bank
  bankName: string;
  bankAcct: string;
  bankIfsc: string;
}


export interface TransactionRequestDTO {
  senderAccountNumber: string;
  receiverAccountNumber?: string;

  amount: number;
  transactionType: TransactionType;
  description: string;

  // External
  beneficiaryName?: string;
  beneficiaryAccountNo?: string;
  beneficiaryIfsc?: string;
  upiId?: string;
  transferMode?: TransferMode;
}