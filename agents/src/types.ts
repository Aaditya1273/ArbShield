// TypeScript Types for LiquidMesh Agents

export interface AgentReport {
	id: string
	agent: 'watcher' | 'strategist' | 'executor'
	timestamp: Date
	content: string
	data?: any
}

export interface LiquidityPosition {
	id: string
	tokenPair: string
	currentRange: [number, number]
	liquidity: number
	feesEarned: number
	apy: number
}

export interface MarketData {
	tokenPair: string
	currentPrice: number
	volume24h: number
	volatility: number
	rangeStatus: 'in' | 'out' | 'near'
}

export interface StrategyDecision {
	id: string
	action: 'adjust_range' | 'rebalance' | 'optimize_fees'
	tokenPair: string
	parameters: any
	reasoning: string
}

export interface ExecutionResult {
	id: string
	strategyId: string
	success: boolean
	transactionHash?: string
	gasUsed?: number
	result?: any
	error?: string
}
