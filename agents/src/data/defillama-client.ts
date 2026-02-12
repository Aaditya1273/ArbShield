/**
 * DefiLlama API Client for Somnia Chain Data
 * Source: https://api-docs.defillama.com/
 *
 * Important: This fetches MAINNET data from Somnia (real DEX pools)
 * Why? Because Somnia testnet has limited DEX deployments
 * Our strategy: Analyze mainnet pools, execute on testnet for safety
 *
 * Real protocols we're monitoring:
 * - QuickSwap (largest, $1.13M TVL)
 * - Somnia Exchange ($312K TVL)
 * - Somnex ($379K TVL)
 * - Standard Protocol
 */

interface DefiLlamaProtocol {
	id: string
	name: string
	symbol: string
	chain: string
	tvl: number
	chainTvls: Record<string, number>
}

interface DefiLlamaPool {
	pool: string
	chain: string
	project: string
	symbol: string
	tvlUsd: number
	apyBase?: number
	apyReward?: number
	apy: number
	rewardTokens?: string[]
	underlyingTokens?: string[]
	volumeUsd1d?: number
	volumeUsd7d?: number
}

export class DefiLlamaClient {
	private baseUrl = 'https://api.llama.fi'
	private yieldsUrl = 'https://yields.llama.fi'

	/**
	 * Get all protocols on Somnia
	 */
	async getSomniaProtocols(): Promise<DefiLlamaProtocol[]> {
		try {
			const response = await fetch(`${this.baseUrl}/protocols`)
			const data = (await response.json()) as DefiLlamaProtocol[]

			// Filter for Somnia chain
			return data.filter(
				(protocol: DefiLlamaProtocol) =>
					protocol.chain === 'Somnia' || protocol.chainTvls?.Somnia > 0
			)
		} catch (error) {
			console.error('[DefiLlama] Error fetching Somnia protocols:', error)
			return []
		}
	}

	/**
	 * Get pool data for Somnia DEXes
	 */
	async getSomniaPools(): Promise<DefiLlamaPool[]> {
		try {
			const response = await fetch(`${this.yieldsUrl}/pools`)
			const data = (await response.json()) as { data: DefiLlamaPool[] }

			// Filter for Somnia chain
			return data.data
				.filter((pool: DefiLlamaPool) => pool.chain === 'Somnia')
				.sort((a: DefiLlamaPool, b: DefiLlamaPool) => b.tvlUsd - a.tvlUsd) // Sort by TVL
		} catch (error) {
			console.error('[DefiLlama] Error fetching Somnia pools:', error)
			return []
		}
	}

	/**
	 * Get TVL for a specific protocol on Somnia
	 */
	async getProtocolTVL(protocolSlug: string): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/protocol/${protocolSlug}`)
			const data = (await response.json()) as { chainTvls?: { Somnia?: { tvl: number } } }
			return data.chainTvls?.Somnia?.tvl || 0
		} catch (error) {
			console.error(`[DefiLlama] Error fetching TVL for ${protocolSlug}:`, error)
			return 0
		}
	}

	/**
	 * Get current TVL for Somnia chain
	 */
	async getSomniaTVL(): Promise<number> {
		try {
			const response = await fetch(`${this.baseUrl}/tvl/somnia`)
			const data = (await response.json()) as number
			return data
		} catch (error) {
			console.error('[DefiLlama] Error fetching Somnia TVL:', error)
			return 0
		}
	}
}

export const defiLlamaClient = new DefiLlamaClient()
