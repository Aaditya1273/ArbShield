// Agent API Response Types

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
