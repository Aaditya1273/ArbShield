import { createPublicClient, http, formatUnits, type Address } from 'viem'
import { somniaTestnet } from '../utils/chain'
import env from '../env'

/**
 * ERC20 Token ABI (minimal subset for balance queries)
 */
const ERC20_ABI = [
	{
		inputs: [{ name: 'account', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'decimals',
		outputs: [{ name: '', type: 'uint8' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'symbol',
		outputs: [{ name: '', type: 'string' }],
		stateMutability: 'view',
		type: 'function',
	},
] as const

/**
 * Somnia Blockchain Client
 * Direct RPC queries to Somnia testnet
 */
export class SomniaClient {
	private client: ReturnType<typeof createPublicClient>

	constructor() {
		this.client = createPublicClient({
			chain: somniaTestnet,
			transport: http(env.SOMNIA_RPC_URL),
		})
	}

	/**
	 * Get STT (native token) balance for an address
	 */
	async getSTTBalance(address: Address): Promise<string> {
		try {
			const balance = await this.client.getBalance({ address })
			return formatUnits(balance, 18)
		} catch (error) {
			console.error(`[Somnia] Error fetching STT balance for ${address}:`, error)
			return '0'
		}
	}

	/**
	 * Get ERC20 token balance
	 */
	async getTokenBalance(tokenAddress: Address, walletAddress: Address): Promise<string> {
		try {
			const [balance, decimals] = await Promise.all([
				this.client.readContract({
					address: tokenAddress,
					abi: ERC20_ABI,
					functionName: 'balanceOf',
					args: [walletAddress],
				}),
				this.client.readContract({
					address: tokenAddress,
					abi: ERC20_ABI,
					functionName: 'decimals',
				}),
			])

			return formatUnits(balance as bigint, decimals as number)
		} catch (error) {
			console.error(`[Somnia] Error fetching token balance for ${tokenAddress}:`, error)
			return '0'
		}
	}

	/**
	 * Get token symbol
	 */
	async getTokenSymbol(tokenAddress: Address): Promise<string> {
		try {
			const symbol = await this.client.readContract({
				address: tokenAddress,
				abi: ERC20_ABI,
				functionName: 'symbol',
			})
			return symbol as string
		} catch (error) {
			console.error(`[Somnia] Error fetching token symbol for ${tokenAddress}:`, error)
			return 'UNKNOWN'
		}
	}

	/**
	 * Get current block number
	 */
	async getBlockNumber(): Promise<bigint> {
		try {
			return await this.client.getBlockNumber()
		} catch (error) {
			console.error('[Somnia] Error fetching block number:', error)
			return BigInt(0)
		}
	}

	/**
	 * Get transaction receipt
	 */
	async getTransactionReceipt(txHash: Address) {
		try {
			return await this.client.getTransactionReceipt({ hash: txHash })
		} catch (error) {
			console.error(`[Somnia] Error fetching tx receipt for ${txHash}:`, error)
			return null
		}
	}
}

export const somniaClient = new SomniaClient()

/**
 * LiquidMesh Contract Addresses on Somnia Testnet
 * All contracts deployed and verified on Shannon Explorer
 */
export const SOMNIA_CONTRACTS = {
	WrappedSTT: '0x9e1B4FbB45F30b0628e4C406A6F4Eec1fadb54E1' as Address,
	MockUSDC: '0x758dA18F8424f637f788a0CD0DAF8407069D380b' as Address,
	LiquidityVault: '0x28205BB97e1BEe146E0b095D3cf62433D9bAb47d' as Address,
	AgentExecutor: '0x5e639e2F345577514aFA0159AEdDf0A832e4139f' as Address,
} as const

/**
 * Legacy token addresses (kept for compatibility)
 */
export const SOMNIA_TESTNET_TOKENS = {
	USDC: '0x0ED782B8079529f7385c3eDA9fAf1EaA0DbC6a17' as Address, // ✅ Real Standard team deployment
	STT: '0x0000000000000000000000000000000000000000' as Address, // Native token (address(0))
} as const
