// Compliance Verification API Response Types

export interface ComplianceProof {
  id: string;
  userAddress: string;
  attributeType: string; // "credit_score", "accredited_investor", etc.
  proofData: string; // ZK proof hex string
  verified: boolean;
  timestamp: string;
  gasUsed?: number;
  verifierContract: string;
}

export interface ComplianceAttribute {
  type: string;
  description: string;
  required: boolean;
  verified: boolean;
  verifiedAt?: string;
}

export interface UserComplianceStatus {
  userAddress: string;
  attributes: ComplianceAttribute[];
  overallCompliant: boolean;
  lastVerified: string;
}

export interface VerificationBenchmark {
  operation: string;
  gasUsed: number;
  executionTime: number; // milliseconds
  cached: boolean;
  timestamp: string;
}

export interface RWAAccessStatus {
  hasAccess: boolean;
  requiredAttributes: string[];
  missingAttributes: string[];
  accessLevel: "none" | "basic" | "full";
}

// Legacy types (kept for backward compatibility during migration)
export interface PoolMetrics {
  poolAddress: string;
  dex: string;
  token0: {
    symbol: string;
    address: string;
  };
  token1: {
    symbol: string;
    address: string;
  };
  currentPrice: number;
  volume24h: number;
  tvl: number;
  apy: number;
  fee: number;
  volatility: number;
  currentRange: {
    lower: number;
    upper: number;
    inRange: boolean;
  };
  feesEarned24h: number;
}

export interface LiquidityPosition {
  poolAddress: string;
  token0Symbol: string;
  token1Symbol: string;
  liquidityUSD: number;
  rangeLower: number;
  rangeUpper: number;
  inRange: boolean;
  feesEarnedUSD: number;
  apy: number;
}

export interface AgentThought {
  id: number;
  created_at: string;
  agent: string;
  text: string;
  tool_calls: any;
  tool_results: any;
}

export interface AgentStatus {
  agent: "watcher" | "strategist" | "executor";
  status: "active" | "idle" | "processing";
  lastAction: string;
  timestamp: string;
}
