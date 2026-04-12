export interface DashboardSummary {
  totalTransactionsToday: number;
  flaggedToday: number;
  noisyAccounts: number;
  avgRiskScoreToday: number;
}

export interface TransactionRisk {
  referenceId: string;
  senderAccountId: number;
  senderAccountNumber: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isFlagged: boolean;
  flagReason: string | null;
  triggeredRules: string[];
  evaluatedAt: string;
}

export interface AccountRisk {
  accountId: number;
  accountNumber: string;
  noiseLevel: 'CLEAN' | 'WATCH' | 'NOISY' | 'BLACKLISTED';
  totalEvaluations: number;
  flaggedCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  averageRiskScore: number;
  peakRiskScore: number;
  cumulativeScore: number;
  lastFlaggedAt: string | null;
  lastEvaluatedAt: string;
  firstSeenAt: string;
}

export type RiskLevel   = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NoiseLevel  = 'CLEAN' | 'WATCH' | 'NOISY' | 'BLACKLISTED';
export type TxnFilter   = 'ALL' | 'FLAGGED' | RiskLevel;
export type AcctFilter  = 'ALL' | NoiseLevel;