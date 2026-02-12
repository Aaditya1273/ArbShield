export interface PoolState {
	price?: string
	reserve0?: bigint
	reserve1?: bigint
}

export interface DepositParams {
	token0: `0x${string}`
	token1: `0x${string}`
	amount0: bigint
	amount1: bigint
	to: `0x${string}`
	deadline?: bigint
}

export interface WithdrawParams {
	token0: `0x${string}`
	token1: `0x${string}`
	liquidity: bigint
	to: `0x${string}`
	deadline?: bigint
}

export interface VenueAdapter {
	venueId: 'somnia-v2' | 'somnex-v3' | 'quickswap-v3'
	getPoolState(params: { token0: `0x${string}`; token1: `0x${string}` }): Promise<PoolState>
	ensureApprovals(params: {
		token: `0x${string}`
		owner: `0x${string}`
		spender: `0x${string}`
		amount: bigint
	}): Promise<string>
	deposit(params: DepositParams): Promise<{ txHash: `0x${string}` }>
	withdraw(params: WithdrawParams): Promise<{ txHash: `0x${string}` }>
}


