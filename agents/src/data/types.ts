export interface PoolMetrics {
	poolAddress: string;
	dex: string; // e.g., 'quickswap', 'somnex'
	token0: {
		symbol: string;
		address: string;
		decimals: number;
	};
	token1: {
		symbol: string;
		address: string;
		decimals: number;
	};
	currentPrice: number;
	volume24h: number;
	tvl: number;
	fee: number; // e.g., 0.003 for 0.3%
	volatility: number; // e.g., 0.15 for 15%
	currentRange: {
		lower: number;
		upper: number;
		inRange: boolean;
	};
	apy: number;
	feesEarned24h: number;
}

export interface WalletBalance {
	symbol: string;
	address: string;
	balance: number;
	balanceUSD: number;
	price: number;
}

export interface LiquidityPosition {
	poolAddress: string;
	token0Symbol: string;
	token1Symbol: string;
	liquidity: number;
	liquidityUSD: number;
	rangeLower: number;
	rangeUpper: number;
	feesEarned: number;
	feesEarnedUSD: number;
	apy: number;
	inRange: boolean;
}
